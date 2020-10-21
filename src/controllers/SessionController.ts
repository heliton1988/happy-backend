import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

import authConfig from '../config/auth';

import User from '../models/User';

interface RequestAuth {
  email: string;
  password: string;
}

export default {
  async create(
    request: Request,
    response: Response,
  ): Promise<Response<RequestAuth>> {
    const { email, password }: RequestAuth = request.body;

    const userRepository = await getRepository(User);

    const user = await userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return response.status(401).json({ error: 'User not found!' });
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      return response
        .status(401)
        .json({ error: 'Incorrect email/password combination' });
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn,
    });

    return response.status(200).json({ user, token });
  },
};
