import { getPrisma } from '../../database/prisma.service';
import { NotFoundError } from '../common/errors/AppError';
import { publishGymDocumentsUploadedEvent } from '../../events/producers/gymEvents';

export class GymDocumentService {
  async upload(
    gymId: string,
    tenantId: string,
    documentType: string,
    file: Express.Multer.File,
    uploadedBy: string,
  ) {
    const prisma = getPrisma();

    const gym = await prisma.gym.findFirst({ where: { id: gymId, tenantId } });
    if (!gym) throw new NotFoundError('Gym');

    const doc = await prisma.gymDocument.create({
      data: {
        gymId,
        documentType,
        fileName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedBy,
        status: 'pending',
      },
    });

    await publishGymDocumentsUploadedEvent(gymId, tenantId, [documentType], uploadedBy).catch(() => {});

    return doc;
  }

  async findByGym(gymId: string, tenantId: string) {
    const prisma = getPrisma();
    const gym = await prisma.gym.findFirst({ where: { id: gymId, tenantId } });
    if (!gym) throw new NotFoundError('Gym');

    return prisma.gymDocument.findMany({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, gymId: string, tenantId: string, status: string) {
    const prisma = getPrisma();
    const gym = await prisma.gym.findFirst({ where: { id: gymId, tenantId } });
    if (!gym) throw new NotFoundError('Gym');

    const doc = await prisma.gymDocument.findFirst({ where: { id, gymId } });
    if (!doc) throw new NotFoundError('Document');

    return prisma.gymDocument.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string, gymId: string, tenantId: string) {
    const prisma = getPrisma();
    const gym = await prisma.gym.findFirst({ where: { id: gymId, tenantId } });
    if (!gym) throw new NotFoundError('Gym');

    const doc = await prisma.gymDocument.findFirst({ where: { id, gymId } });
    if (!doc) throw new NotFoundError('Document');

    await prisma.gymDocument.delete({ where: { id } });
  }
}

export const gymDocumentService = new GymDocumentService();
