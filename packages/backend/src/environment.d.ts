import { IncomingMessage } from 'node:http';
import { GrantSession } from 'grant';
import mongoose from 'mongoose';
import { User as MyUser } from './models/User';
import { TokenWebSocketServer } from './routes/ws';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends MyUser {}
  }
  // eslint-disable-next-line vars-on-top, no-var
  var __MONGO_URI__: string;
}

// not used
interface ImportMeta {
  env: {
    PORT?: string;
    LOG_FORMAT?: 'json';
    HEALTHPORT?: string;
    VERSION?: string;
    NAME?: string;
    NODE_ENV: 'development' | 'production';
    HTTPS_CERT?: string;
    HTTPS_KEY?: string;
    HTTPS_HSTS?: string;
    PROXY?: 'true';
    HTTPS_PROXY?: string;
    LOG_LEVEL?: string;
    AUTH_CLIENT_ID: string;
    AUTH_SECRET: string;
    MONGO_CONNECTION: string;
    ORIGIN: string;
  };
}

declare module 'koa' {
  interface Session {
    id?: mongoose.Types.ObjectId;
    grant?: GrantSession;
  }
  interface BaseContext {
    session?: Session;
    apiPath: string;
    authPath: string;
    wss: TokenWebSocketServer;
  }

  interface DefaultContext {
    req: IncomingMessage & {
      oldPath: string;
    };
  }
}
