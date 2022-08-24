// import cors from '@koa/cors';
import Router from '@koa/router';
import Ajv from 'ajv';
import bodyParser from 'koa-bodyparser';
import { AuthContext, hasRoles, initAuthContext, logout, requiresRoles } from '../../auth';
import { User } from '../../db';
import logger from '../../logger';
import { User as UserType, Role } from '../../models/User';
// import Ajv from 'ajv';
import { base /*, userSchema */, userPatchSchema } from './documentation';
// import bodyParser from 'koa-bodyparser';

type SortingKeys = keyof UserType | '_id';

interface UserPatch {
  givenName?: string;
}

const DEFAULTPAGESIZE = 10,
  ADMINROLES : Array<Role> | Role = 'admin',
  ajv = new Ajv(),
  validators = {
    userPatchSchema: ajv.compile<UserPatch>(userPatchSchema)
  };

function mergeSorting(sortBy?: string | string[], order?: string | string[], filter = ['id', 'email', 'givenNamen', 'name', 'roles', 'createdAt', 'updatedAt']) : Array<[SortingKeys, 1 | -1]> {
  const orderArray = (!order || Array.isArray(order)) ? order : [order],
    mergedSorting = (Array.isArray(sortBy)
      ? sortBy
      : [sortBy])
      .map((field, index) => field && // only sort on these keys
        filter.includes(field)
        ? [field === 'id' ? '_id' : field, orderArray?.[index] === '-1' ? -1 : 1]
        : undefined
      ).filter(Boolean);
  if (mergedSorting.length === 0) {
    return [['_id', 1]];
  }
  return mergedSorting as Array<[SortingKeys, 1 | -1]>;
}
export default async function init() {
  const router = new Router()
    // .use(cors())
    .all(
      `/${base}(.*)`,
      bodyParser({
        enableTypes: ['json'],
        jsonLimit: '10kb'
      }),
      initAuthContext(true) // always retrieve the user from db for this endpoints
    )
    /* get a list of all users. For admins only */
    .get(`/${base}s`, requiresRoles('admin'), async (context: AuthContext) => {
      logger.debug('get all users');
      const { dir: direction, sortBy, pagesize: pagesizeString, order, item } = context.query,
        pagesize = typeof pagesizeString === 'string' ? Number.parseInt(pagesizeString) : Number.NaN,
        sortByArray = mergeSorting(sortBy, order),
        primarySortField = sortByArray[0][0],
        lte = direction === '<',
        users = await User.find({
          ...(typeof item === 'string' && item && {
            [primarySortField]: {
              [lte ? '$lte' : '$gte']: item
            }
          })
        })
          .limit((Number.isNaN(pagesize) ? DEFAULTPAGESIZE : pagesize) + (item ? 2 : 1))
          .sort(Object.fromEntries(lte ? sortByArray.map(([field, reverse]) => [field, reverse === 1 ? -1 : 1]) : sortByArray));
      if (item != null && users[0]?.[primarySortField].toString() !== item) {
        users.pop();
      }
      context.body = lte ? users.reverse() : users;
    })

    /* get general user information. Only admins for retrive for other user */
    .get(`/${base}/:id?`, async (context: AuthContext) => {
      const user = context.state.user,
        id = context.params.id ?? user.id;
      context.assert(id === user.id || hasRoles(context, ADMINROLES), 403);
      logger.debug(`user #${user.id} gets info for target #${id}`);

      const target = id === user.id ? user : await User.findById(id);
      context.assert(target != null, 404);
      // convert Mongoose Model (roles) to propper JSON?
      context.body = target;
    })

    /* Update non-readonly user attributes. Regular user are only allowed to fetch their own information */
    .patch(`/${base}/:id?`, async (context: AuthContext) => {
      context.assert(validators.userPatchSchema(context.request.body), 400);
      const user = context.state.user,
        id = context.params.id ?? user.id;
      context.assert(id === user.id || hasRoles(context, ADMINROLES), 403);
      logger.info(`user #${user.id} updates profile of ${id}`);

      const target = await User.findByIdAndUpdate(id, context.request.body, {
        returnOriginal: false
      });
      context.assert(target != null, 404);
      context.body = {
        result: 'ok',
        details: target
      };
    })

    /* delete user account. Only admins can do that for other user */
    .delete(`/${base}/:id?`, async (context: AuthContext) => {
      const user = context.state.user,
        id = context.params.id ?? user.id;
      context.assert(id === user.id || hasRoles(context, ADMINROLES), 403);
      logger.debug(`user #${user.id} deletes target #${id}`);

      const target = id === user.id ? user : await User.findById(id);
      context.assert(target != null, 404);
      if (target.id === user.id) {
        await logout(context);
      }
      await target.delete();
      // convert Mongoose Model (roles) to propper JSON?
      context.body = {
        result: 'ok',
        details: target
      };
    });

  return router;
}
