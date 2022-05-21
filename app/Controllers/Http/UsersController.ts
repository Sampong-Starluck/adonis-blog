import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class UsersController {
  // TODO: Create route for user to register, login, and logout

  public async register({ request, response }: HttpContextContract) {
    const validation = await schema.create({
      email: schema.string({}, [rules.email(), rules.unique({ table: 'user', column: 'email' })]),
      username: schema.string({}, [rules.unique({ table: 'user', column: 'username' })]),
      passwod: schema.string({}, [rules.confirmed()]),
    })

    const data = await request.validate({ schema: validation })
    const user = await User.create(data)

    return response.created(user)
  }

  public async login({ request, response, auth }: HttpContextContract) {
    const password = await request.input('password')
    const email = await request.input('email')

    try {
      const apiTokens = await auth.use('api').attempt(email, password, { expiresIn: '24hours' })
      return apiTokens.toJSON()
    } catch (error) {
      return response
        .status(400)
        .send(error({ message: 'User credential could not be found !!!!' }))
    }
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.logout()
    return response.status(200)
  }
}
