import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true, trim: true })
  descripcion: string;

  @Prop({ default: '' })
  imagen: string; // URL de Cloudinary (opcional)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  meGusta: Types.ObjectId[];

  @Prop({ default: false })
  eliminado: boolean; // baja lógica
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
