const base = 'user',
  userSchema = {
    type: 'object',
    required: ['createdAt', 'email', 'id', 'name', 'roles', 'updatedAt'],
    additionalProperties: false,
    properties: {
      createdAt: {
        type: 'string',
        format: 'date-time'
      },
      email: {
        type: 'string'
      },
      givenName: {
        type: 'string'
      },
      id: {
        type: 'string'
        //, format: 'uuid' ?
      },
      name: {
        type: 'string'
      },
      provider: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      roles: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      updatedAt: {
        type: 'string',
        format: 'date-time'
      }
    }
  },
  userPatchSchema = {
    type: 'object',
    minProperties: 1,
    additionalProperties: false,
    properties: {
      givenName: {
        type: 'string'
      }
    }
  },
  simpleResponse = {
    'application/json': {
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['result', 'details'],
        properties: {
          result: {
            type: 'string',
            enum: ['ok']
          },
          details: userSchema
        }
      }
    }
  };

export default {
  [`/${base}s`]: {
    get: {
      tags: [base],
      summary: 'Get a list of all user',
      responses: {
        200: {
          description: 'List of all user. Paged, ordered',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['total', 'items'],
                additionalProperties: false,
                properties: {
                  items: {
                    type: 'array',
                    items: userSchema
                  },
                  total: {
                    type: 'number'
                  }
                }
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        }
      },
      security: [
        {
          bearerAuth: ['admin'],
          cookieAuth: ['admin']
        }
      ]
    }
  },
  [`/${base}`]: {
    get: {
      tags: [base],
      summary: 'Get info about current user',
      responses: {
        200: {
          description: 'User info. Regular user are only allowed to fetch their own information',
          content: {
            'application/json': {
              schema: userSchema
            }
          }
        },
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        }
      },
      security: [
        {
          bearerAuth: [],
          cookieAuth: []
        }
      ]
    },
    patch: {
      tags: [base],
      summary: 'Update non-readonly user attributes. Regular user are only allowed to fetch their own information',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: userPatchSchema
          }
        }
      },
      responses: {
        200: {
          description: 'User info. Regular user are only allowed to update their own information',
          content: {
            'application/json': {
              schema: simpleResponse
            }
          }
        },
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        }
      },
      security: [
        {
          bearerAuth: [],
          cookieAuth: []
        }
      ]
    },
    delete: {
      tags: [base],
      summary: 'Deletes the account of the current user',
      responses: {
        200: {
          description: 'Deleted user info. Regular user are only allowed to delete their own account',
          content: {
            'application/json': {
              schema: simpleResponse
            }
          }
        },
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        }
      },
      security: [
        {
          bearerAuth: [],
          cookieAuth: []
        }
      ]
    }
  },
  [`/${base}/{id}`]: {
    get: {
      tags: [base],
      summary: 'Get info about a specific user',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: false,
          schema: {
            type: 'string'
            //, format: 'uuid' ?
          },
          description: 'the id of the user'
        }
      ],
      responses: {
        200: {
          description: 'User info',
          content: {
            'application/json': {
              schema: simpleResponse
            }
          }
        },
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        },
        404: {
          $ref: '#/components/responses/NotFound'
        }
      },
      security: [
        {
          bearerAuth: [],
          cookieAuth: []
        }
      ]
    },
    patch: {
      tags: [base],
      summary: 'Update non-readonly attributes of a specific user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: userPatchSchema
          }
        }
      },
      responses: {
        200: {
          description: 'Deleted user info. Regular user are only allowed to delete their own account',
          content: {
            'application/json': {
              schema: simpleResponse
            }
          }
        },
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        },
        404: {
          $ref: '#/components/responses/NotFound'
        }
      },
      security: [
        {
          bearerAuth: [],
          cookieAuth: []
        }
      ]
    },
    delete: {
      tags: [base],
      summary: 'Deletes the account of a specific user',
      responses: {
        200: {
          description: 'Deleted user info',
          content: {
            'application/json': {
              schema: simpleResponse
            }
          }
        },
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        },
        404: {
          $ref: '#/components/responses/NotFound'
        }
      },
      security: [
        {
          bearerAuth: [],
          cookieAuth: []
        }
      ]
    }
  }
};

export { base, simpleResponse, userSchema, userPatchSchema };
