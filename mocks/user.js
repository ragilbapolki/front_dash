import {
  tokens,
  users
} from './config'
import {
  response
} from './response.js'

export default [{
    path: '/user/login',
    type: 'post',
    handler: async ({
      request
    }) => {
      const {
        username
      } = await request.json()
      const token = tokens[username]
      if (!token) {
        return response({
          status: 0,
          message: 'Account and password are incorrect.'
        })
      }
      return response({
        body: token
      })
    }
  },
  {
    path: '/user/info',
    type: 'get',
    handler: ({
      request
    }) => {
      const token = request.headers.get('token')
      const info = users[token]
      if (!info) {
        return response({
          status: -1,
        })
      }
      return response({
        body: info
      })
    }
  },
  {
    path: '/user/logout',
    type: 'post',
    handler: () => {
      return response()
    }
  },

];
