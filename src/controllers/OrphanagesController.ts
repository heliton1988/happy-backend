import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import orphanageView from '../views/orphanages_view';
import Orphanage from '../models/Orphanage';

interface OrphanageData {
  name: string;
  latitude: number;
  longitude: number;
  about: string;
  instructions: string;
  opening_hours: string;
  open_on_weekends: boolean;
}

export default {
  // List every orphanages there're on database
  async index(
    request: Request,
    response: Response,
  ): Promise<Response<Orphanage>> {
    const orphanagesRepository = getRepository(Orphanage);

    const orphanage = await orphanagesRepository.find({
      relations: ['images'],
    });

    return response.status(200).json(orphanageView.renderMany(orphanage));
  },

  // List just one orphanage
  async show(
    request: Request,
    response: Response,
  ): Promise<Response<Orphanage>> {
    const { id } = request.params;

    const orphanagesRepository = getRepository(Orphanage);

    const orphanage = await orphanagesRepository.findOneOrFail({
      // findOneOrFail
      where: { id },
      relations: ['images'],
    });

    if (!orphanage) {
      return response.status(400).json({ error: 'Orphanage does not exists!' });
    }

    return response.status(200).json(orphanageView.render(orphanage));
  },

  // Create a orphanage on database
  async create(
    request: Request,
    response: Response,
  ): Promise<Response<Orphanage>> {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    }: OrphanageData = request.body;

    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = request.files as Express.Multer.File[];

    const images = requestImages.map(image => {
      return { path: image.filename };
    });

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images,
    };

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      about: Yup.string().required().max(300),
      instructions: Yup.string().required(),
      opening_hours: Yup.string().required(),
      open_on_weekends: Yup.boolean().required(),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required(),
        }),
      ),
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const orphanage = await orphanagesRepository.create(data);

    await orphanagesRepository.save(orphanage);

    return response.status(201).json(orphanage);
  },
};
