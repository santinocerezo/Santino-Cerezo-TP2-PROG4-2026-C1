import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // Crea y guarda un usuario nuevo.
  crear(datos: Partial<User>): Promise<UserDocument> {
    const nuevo = new this.userModel(datos);
    return nuevo.save();
  }

  buscarPorCorreo(correo: string) {
    return this.userModel.findOne({ correo: correo.toLowerCase() }).exec();
  }

  buscarPorNombreUsuario(nombreUsuario: string) {
    return this.userModel.findOne({ nombreUsuario }).exec();
  }

  // Permite encontrar al usuario tanto por correo como por nombre de usuario
  // (se usa en el login).
  buscarPorCorreoONombre(identificador: string) {
    return this.userModel
      .findOne({
        $or: [
          { correo: identificador.toLowerCase() },
          { nombreUsuario: identificador },
        ],
      })
      .exec();
  }

  buscarPorId(id: string) {
    return this.userModel.findById(id).exec();
  }
}
