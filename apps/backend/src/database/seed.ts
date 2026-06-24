import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../modules/common/utils/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ---- Tenants ----
  const tenant1 = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: { name: 'Demo Organization', slug: 'demo', domain: 'demo.fitcore.local', isActive: true },
  });

  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'pilot-partner' },
    update: {},
    create: { name: 'Pilot Partner', slug: 'pilot-partner', domain: 'pilot.fitcore.local', isActive: true },
  });

  // ---- Admin user ----
  const passwordHash = await hashPassword('admin1234');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fitcore.local' },
    update: {},
    create: {
      tenantId: tenant1.id,
      email: 'admin@fitcore.local',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      emailVerified: true,
    },
  });

  // ---- Roles (platform-level) ----
  const rolesData = [
    { name: 'Super Admin', slug: 'super_admin', description: 'Full platform access', isSystem: true, priority: 0 },
    { name: 'Gym Owner', slug: 'gym_owner', description: 'Owns and manages gyms', isSystem: true, priority: 10 },
    { name: 'Gym Manager', slug: 'gym_manager', description: 'Manages gym operations', isSystem: true, priority: 20 },
    { name: 'Staff', slug: 'staff', description: 'Gym staff member', isSystem: true, priority: 30 },
    { name: 'Customer', slug: 'customer', description: 'Gym member', isSystem: true, priority: 100 },
  ];

  const roles1 = await Promise.all(
    rolesData.map((r) =>
      prisma.role.upsert({
        where: { tenantId_slug: { tenantId: tenant1.id, slug: r.slug } },
        update: {},
        create: { ...r, tenantId: tenant1.id },
      }),
    ),
  );
  const roles2 = await Promise.all(
    rolesData.map((r) =>
      prisma.role.upsert({
        where: { tenantId_slug: { tenantId: tenant2.id, slug: r.slug } },
        update: r.isSystem ? {} : {},
        create: { ...r, tenantId: tenant2.id },
      }),
    ),
  );

  const permissionData = [
    { name: 'gym:create', category: 'gym' },
    { name: 'gym:read', category: 'gym' },
    { name: 'gym:update', category: 'gym' },
    { name: 'gym:delete', category: 'gym' },
    { name: 'gym:verify', category: 'gym' },
    { name: 'user:create', category: 'user' },
    { name: 'user:read', category: 'user' },
    { name: 'user:update', category: 'user' },
    { name: 'user:delete', category: 'user' },
    { name: 'role:create', category: 'role' },
    { name: 'role:read', category: 'role' },
    { name: 'role:assign', category: 'role' },
    { name: 'document:upload', category: 'document' },
    { name: 'document:approve', category: 'document' },
    { name: 'plan:create', category: 'billing' },
    { name: 'plan:read', category: 'billing' },
    { name: 'plan:update', category: 'billing' },
    { name: 'membership:read', category: 'billing' },
    { name: 'payment:read', category: 'billing' },
    { name: 'payment:write', category: 'billing' },
    { name: 'supplement:read', category: 'supplement' },
    { name: 'supplement:manage', category: 'supplement' },
    { name: 'supplement:order', category: 'supplement' },
    { name: 'trainer:read', category: 'personal_training' },
    { name: 'trainer:manage', category: 'personal_training' },
    { name: 'pt-package:read', category: 'personal_training' },
    { name: 'pt-package:manage', category: 'personal_training' },
    { name: 'session:read', category: 'personal_training' },
    { name: 'session:manage', category: 'personal_training' },
    { name: 'commission:read', category: 'personal_training' },
    { name: 'commission:manage', category: 'personal_training' },
    { name: 'admin:events', category: 'admin' },
    { name: 'equipment:read', category: 'equipment' },
    { name: 'equipment:manage', category: 'equipment' },
  ];

  const permissions = await Promise.all(
    permissionData.map((p) =>
      prisma.permission.upsert({
        where: { name: p.name },
        update: {},
        create: p,
      }),
    ),
  );

  const adminRole = roles1.find((r) => r.slug === 'super_admin')!;
  const existingUserRole = await prisma.userRole.findFirst({
    where: { userId: admin.id, roleId: adminRole.id, gymId: null },
  });
  if (!existingUserRole) {
    await prisma.userRole.create({
      data: { tenantId: tenant1.id, userId: admin.id, roleId: adminRole.id },
    });
  }

  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // ---- Notification templates ----
  const notificationTemplateData = [
    { channel: 'email', eventName: 'user.registered', subject: 'Welcome to FitCore Pro', body: 'Hi {{name}}, welcome to FitCore Pro!' },
    { channel: 'email', eventName: 'user.password_reset_requested', subject: 'Password Reset Request', body: 'Click here to reset your password: {{resetLink}}' },
    { channel: 'email', eventName: 'gym.verification_approved', subject: 'Gym Verified', body: 'Your gym {{gymName}} has been verified and is now active.' },
    { channel: 'email', eventName: 'gym.verification_rejected', subject: 'Gym Verification Rejected', body: 'Your gym {{gymName}} was rejected. Reason: {{reason}}' },
    { channel: 'sms', eventName: 'user.registered', body: 'Welcome to FitCore Pro!' },
  ];

  for (const tenant of [tenant1, tenant2]) {
    for (const tmpl of notificationTemplateData) {
      await prisma.notificationTemplate.upsert({
        where: { channel_eventName_tenantId: { channel: tmpl.channel, eventName: tmpl.eventName, tenantId: tenant.id } },
        update: {},
        create: { ...tmpl, tenantId: tenant.id, isActive: true },
      });
    }
  }

  // ---- Pilot gym users ----
  const gymOwner1Pw = await hashPassword('gymowner1');
  const gymOwner2Pw = await hashPassword('gymowner2');
  const gymOwner3Pw = await hashPassword('gymowner3');

  const gymOwner1 = await prisma.user.upsert({
    where: { email: 'owner-active@fitcore.local' },
    update: {},
    create: {
      tenantId: tenant1.id,
      email: 'owner-active@fitcore.local',
      passwordHash: gymOwner1Pw,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      isActive: true,
      emailVerified: true,
    },
  });
  const gymOwner2 = await prisma.user.upsert({
    where: { email: 'owner-pending@fitcore.local' },
    update: {},
    create: {
      tenantId: tenant1.id,
      email: 'owner-pending@fitcore.local',
      passwordHash: gymOwner2Pw,
      firstName: 'Priya',
      lastName: 'Sharma',
      isActive: true,
      emailVerified: true,
    },
  });
  const gymOwner3 = await prisma.user.upsert({
    where: { email: 'owner-rejected@fitcore.local' },
    update: {},
    create: {
      tenantId: tenant2.id,
      email: 'owner-rejected@fitcore.local',
      passwordHash: gymOwner3Pw,
      firstName: 'Amit',
      lastName: 'Singh',
      isActive: true,
      emailVerified: true,
    },
  });

  const gymOwnerRole1 = roles1.find((r) => r.slug === 'gym_owner')!;
  const gymOwnerRole2 = roles2.find((r) => r.slug === 'gym_owner')!;

  const assignRole = async (userId: string, roleId: string, tenantId: string, gymId?: string) => {
    const existing = await prisma.userRole.findFirst({
      where: { userId, roleId, gymId: gymId ?? null },
    });
    if (!existing) {
      await prisma.userRole.create({ data: { tenantId, userId, roleId, gymId } });
    }
  };

  const staffPw = await hashPassword('staff1234');
  const managerPw = await hashPassword('manager1234');

  const staffUser1 = await prisma.user.upsert({
    where: { email: 'staff-active@fitcore.local' },
    update: {},
    create: {
      tenantId: tenant1.id,
      email: 'staff-active@fitcore.local',
      passwordHash: staffPw,
      firstName: 'Vikram',
      lastName: 'Patel',
      isActive: true,
      emailVerified: true,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager-active@fitcore.local' },
    update: {},
    create: {
      tenantId: tenant1.id,
      email: 'manager-active@fitcore.local',
      passwordHash: managerPw,
      firstName: 'Sneha',
      lastName: 'Rao',
      isActive: true,
      emailVerified: true,
    },
  });

  // ---- Pilot gyms ----
  // Gym 1: Fully verified (tenant1)
  const gym1 = await prisma.gym.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'demo-active-gym' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      ownerId: gymOwner1.id,
      name: 'Demo Active Gym',
      slug: 'demo-active-gym',
      email: 'active-gym@fitcore.local',
      phone: '9812345670',
      addressLine1: '123 Fitness Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'IN',
      pincode: '400001',
      isActive: true,
      onboardingStatus: 'active',
      maxStaffCount: 10,
      maxMemberCount: 500,
      openingTime: '06:00',
      closingTime: '22:00',
      operatingDays: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      timezone: 'Asia/Kolkata',
    },
  });

  // Gym 2: Pending review (tenant1)
  const gym2 = await prisma.gym.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'demo-pending-gym' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      ownerId: gymOwner2.id,
      name: 'Demo Pending Gym',
      slug: 'demo-pending-gym',
      email: 'pending-gym@fitcore.local',
      phone: '9812345671',
      addressLine1: '456 Wellness Avenue',
      city: 'Delhi',
      state: 'Delhi',
      country: 'IN',
      pincode: '110001',
      isActive: false,
      onboardingStatus: 'review',
      maxStaffCount: 5,
      maxMemberCount: 200,
      openingTime: '07:00',
      closingTime: '21:00',
      operatingDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
      timezone: 'Asia/Kolkata',
    },
  });

  // Gym 3: Rejected (tenant2)
  const gym3 = await prisma.gym.upsert({
    where: { tenantId_slug: { tenantId: tenant2.id, slug: 'demo-rejected-gym' } },
    update: {},
    create: {
      tenantId: tenant2.id,
      ownerId: gymOwner3.id,
      name: 'Demo Rejected Gym',
      slug: 'demo-rejected-gym',
      email: 'rejected-gym@fitcore.local',
      phone: '9812345672',
      addressLine1: '789 Health Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'IN',
      pincode: '560001',
      isActive: false,
      onboardingStatus: 'rejected',
      rejectionReason: 'Business license did not match registered address. Please upload updated utility bill.',
      maxStaffCount: 3,
      maxMemberCount: 100,
      openingTime: '06:30',
      closingTime: '21:30',
      operatingDays: 'Mon,Tue,Wed,Thu,Fri',
      timezone: 'Asia/Kolkata',
    },
  });

  // ---- Gym documents ----
  const docTypes = ['business_license', 'owner_id_proof', 'gym_photo', 'utility_bill'] as const;
  const approvedDocs = docTypes.map((dt) => ({
    gymId: gym1.id,
    documentType: dt,
    fileName: `${dt}.pdf`,
    filePath: `uploads/${gym1.id}/${dt}.pdf`,
    mimeType: 'application/pdf',
    fileSize: 102400,
    status: 'approved' as const,
    uploadedBy: gymOwner1.id,
  }));
  for (const doc of approvedDocs) {
    await prisma.gymDocument.upsert({
      where: { gymId_documentType: { gymId: doc.gymId, documentType: doc.documentType } },
      update: {},
      create: doc,
    });
  }

  const pendingDoc = {
    gymId: gym2.id,
    documentType: 'business_license' as const,
    fileName: 'business_license.pdf',
    filePath: `uploads/${gym2.id}/business_license.pdf`,
    mimeType: 'application/pdf',
    fileSize: 204800,
    status: 'pending' as const,
    uploadedBy: gymOwner2.id,
  };
  await prisma.gymDocument.upsert({
    where: { gymId_documentType: { gymId: pendingDoc.gymId, documentType: pendingDoc.documentType } },
    update: {},
    create: pendingDoc,
  });

  // ---- Gym staff assignments ----
  const staffRole1 = roles1.find((r) => r.slug === 'staff')!;
  const managerRole1 = roles1.find((r) => r.slug === 'gym_manager')!;

  // Assign gym owner roles with gym scope
  await assignRole(gymOwner1.id, gymOwnerRole1.id, tenant1.id, gym1.id);
  await assignRole(gymOwner2.id, gymOwnerRole1.id, tenant1.id, gym2.id);
  await assignRole(gymOwner3.id, gymOwnerRole2.id, tenant2.id, gym3.id);

  // Assign staff and manager roles
  await assignRole(staffUser1.id, staffRole1.id, tenant1.id, gym1.id);
  await assignRole(managerUser.id, managerRole1.id, tenant1.id, gym1.id);

  // ---- Create permission templates for pilot gyms ----
  const pilotPerms = await prisma.permission.findMany({
    where: { name: { in: ['gym:read', 'gym:update', 'gym:create', 'user:read', 'document:upload'] } },
  });
  for (const role of [gymOwnerRole1, gymOwnerRole2, managerRole1, staffRole1]) {
    for (const perm of pilotPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  console.log(`Seeded: 2 tenants, admin "${admin.email}", 3 pilot gyms, documents, staff`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
