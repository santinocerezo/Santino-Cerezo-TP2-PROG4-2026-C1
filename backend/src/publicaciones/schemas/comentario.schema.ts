import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ timestamps: true })
export class Comentario {
  // Publicación a la que pertenece el comentario.
  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true })
  publicacion: Types.ObjectId;

  // Usuario que escribió el comentario.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ required: true, trim: true })
  mensaje: string;

  // Se pone en true cuando el autor edita el comentario.
  @Prop({ default: false })
  modificado: boolean;

  @Prop({ default: false })
  eliminado: boolean; // baja lógica (se usa desde el Sprint 4)
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

ComentarioSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.__v;
    return ret;
  },
});
