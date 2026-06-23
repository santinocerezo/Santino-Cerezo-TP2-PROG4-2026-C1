import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
export type Perfil = 'usuario' | 'administrador';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo: string;

  @Prop({ required: true, unique: true, trim: true })
  nombreUsuario: string;

  @Prop({ required: true })
  password: string; // SIEMPRE encriptada con bcrypt

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '' })
  descripcion: string;

  @Prop({ default: '' })
  fotoPerfil: string; // URL de la imagen en Cloudinary

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil: Perfil;

  @Prop({ default: false })
  eliminado: boolean; // baja lógica (se utiliza desde el Sprint 4)
}

export const UserSchema = SchemaFactory.createForClass(User);

// Cuando el usuario se convierte a JSON (en las respuestas) nunca exponemos
// la contraseña ni el campo interno __v de Mongo.
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});
