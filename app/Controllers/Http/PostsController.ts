import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from 'App/Models/Post'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class PostsController {
  // TODO: Create controller for basic CRUD and display index show + show all

  public async index({}: HttpContextContract) {
    const post = await Post.all()
    return post
  }

  public async show({ response, params }: HttpContextContract) {
    const post = await Post.find(params.id)

    if (!post) {
      return response.status(404).send({ message: 'Post not found' })
    }

    return response.ok(post)
  }

  public async store({ response, request, auth }: HttpContextContract) {
    if (await auth.check()) {
      // if condition is TRUE do something
      const postSchema = schema.create({
        title: schema.string({ trim: true }, [
          rules.maxLength(255),
          rules.unique({
            table: 'posts',
            column: 'title',
          }),
        ]),
        content: schema.string({}, [rules.unique({ table: 'posts', column: 'content' })]),
      })

      const payload = await request.validate({ schema: postSchema })
      const post = await Post.create(payload)

      await post.save()

      return response.status(201).send({ message: 'Post created' })
    } else {
      // do something else
      return response.status(404).send({ message: 'Unauthorized access' })
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const updateSchema = schema.create({
      title: schema.string({ trim: true }, [
        rules.maxLength(255),
        rules.unique({
          table: 'posts',
          column: 'title',
        }),
      ]),
      content: schema.string({}, [rules.unique({ table: 'posts', column: 'content' })]),
    })
    const payload = await request.validate({ schema: updateSchema })

    // const post = await Post.find(params.id)

    // if (!post) {
    //   return response.status(400).send({ message: 'Post not found' })
    // }

    // post.title = payload.title
    // post.content = payload.content

    // await post.save()

    // or use this line insteat

    await Post.query().where('id', params.id).update(payload)

    return response.status(202).send({ message: 'Post has updated' })
  }

  public async delete({ response, params }: HttpContextContract) {
    const post = await Post.find(params.id)

    if (!post) {
      return response.status(400).send({ message: 'Post not found' })
    }

    await post.delete()

    return response.status(200).send({ message: 'Post deleted successfully' })
  }
}
