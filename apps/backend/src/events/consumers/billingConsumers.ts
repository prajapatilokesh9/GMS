import type { BaseEvent } from '../BaseEvent';
import { createWorker } from '../event-bus';
import logger from '../../core/logger';

export function startBillingConsumer(): void {
  createWorker('billing', async (event: BaseEvent) => {
    switch (event.eventName) {
      case 'plan.created': {
        const { planId, name, type } = event.payload as any;
        logger.info(`Plan created: ${name} (${type}) [${planId}]`);
        break;
      }
      case 'plan.updated': {
        const { planId, changes } = event.payload as any;
        logger.info(`Plan updated: ${planId} — changes: ${changes.join(', ')}`);
        break;
      }
      case 'membership.created': {
        const { membershipId, customerId, planId: pid, pricePaid } = event.payload as any;
        logger.info(`Membership created: ${membershipId} customer=${customerId} plan=${pid} amount=${pricePaid}`);
        break;
      }
      case 'membership.renewed': {
        const { membershipId: mid, customerId: cid, gymId: gid, pricePaid: pp } = event.payload as any;
        logger.info(`Membership renewed: ${mid} customer=${cid} gym=${gid} amount=${pp}`);
        break;
      }
      case 'membership.updated': {
        const { membershipId: muid, status: mstatus } = event.payload as any;
        logger.info(`Membership updated: ${muid} status=${mstatus}`);
        break;
      }
      case 'payment.completed': {
        const { paymentId, entityType, entityId, amount } = event.payload as any;
        logger.info(`Payment completed: ${paymentId} ${entityType}=${entityId} amount=${amount}`);
        break;
      }
      case 'payment.failed': {
        const { paymentId: pfid, entityType: pfet, entityId: pfeid } = event.payload as any;
        logger.warn(`Payment failed: ${pfid} ${pfet}=${pfeid}`);
        break;
      }
      case 'wallet.topup': {
        const { membershipId: wmid, amount: wamt, balance } = event.payload as any;
        logger.info(`Wallet topup: ${wmid} +${wamt} new_balance=${balance}`);
        break;
      }
      // PT events
      case 'pt.trainer.created': {
        const { trainerId: ttid, userId: ttuid } = event.payload as any;
        logger.info(`PT Trainer created: ${ttid} user=${ttuid}`);
        break;
      }
      case 'pt.trainer.updated': {
        const { trainerId: ttuid2 } = event.payload as any;
        logger.info(`PT Trainer updated: ${ttuid2}`);
        break;
      }
      case 'pt.session.created': {
        const { sessionId: scid, trainerId: sctid } = event.payload as any;
        logger.info(`PT Session created: ${scid} trainer=${sctid}`);
        break;
      }
      case 'pt.session.started': {
        const { sessionId: ssid } = event.payload as any;
        logger.info(`PT Session started: ${ssid}`);
        break;
      }
      case 'pt.session.completed': {
        const { sessionId: scoid } = event.payload as any;
        logger.info(`PT Session completed: ${scoid}`);
        break;
      }
      case 'pt.session.cancelled': {
        const { sessionId: scaid } = event.payload as any;
        logger.info(`PT Session cancelled: ${scaid}`);
        break;
      }
      case 'pt.package.created': {
        const { packageId: ppcid, name: ppcn } = event.payload as any;
        logger.info(`PT Package created: ${ppcn} [${ppcid}]`);
        break;
      }
      case 'pt.package.updated': {
        const { packageId: ppuid } = event.payload as any;
        logger.info(`PT Package updated: ${ppuid}`);
        break;
      }
      case 'pt.commission.generated': {
        const { payoutId: cgpid, sessionId: cgsid, commissionAmount } = event.payload as any;
        logger.info(`Commission generated: ${cgpid} session=${cgsid} amount=${commissionAmount}`);
        break;
      }
      case 'pt.commission.approved': {
        const { payoutId: capid } = event.payload as any;
        logger.info(`Commission approved: ${capid}`);
        break;
      }
      case 'pt.commission.paid': {
        const { payoutId: cppid, paymentReference } = event.payload as any;
        logger.info(`Commission paid: ${cppid} ref=${paymentReference}`);
        break;
      }
      // Supplement events
      case 'supplement.company.created': {
        const { companyId: ccid, name: ccname } = event.payload as any;
        logger.info(`Supplement company created: ${ccname} [${ccid}]`);
        break;
      }
      case 'supplement.company.updated': {
        const { companyId: cuid } = event.payload as any;
        logger.info(`Supplement company updated: ${cuid}`);
        break;
      }
      case 'supplement.created': {
        const { supplementId: sid, name: sname, companyId: scid } = event.payload as any;
        logger.info(`Supplement created: ${sname} company=${scid} [${sid}]`);
        break;
      }
      case 'supplement.updated': {
        const { supplementId: suid } = event.payload as any;
        logger.info(`Supplement updated: ${suid}`);
        break;
      }
      case 'supplement.order.created': {
        const { orderId: oid, supplementId: osid, quantity: oqty, totalAmount: ototal } = event.payload as any;
        logger.info(`Supplement order created: ${oid} supp=${osid} qty=${oqty} total=${ototal}`);
        break;
      }
      case 'supplement.order.updated': {
        const { orderId: ouid, status: ost } = event.payload as any;
        logger.info(`Supplement order updated: ${ouid} status=${ost}`);
        break;
      }
      // Equipment events
      case 'equipment.catalogue.created': {
        const { catalogueId: eccid, name: eccname, brand: eccbrand, model: eccmodel } = event.payload as any;
        logger.info(`Equipment catalogue created: ${eccbrand} ${eccmodel} (${eccname}) [${eccid}]`);
        break;
      }
      case 'equipment.catalogue.updated': {
        const { catalogueId: ecuuid, name: ecuname } = event.payload as any;
        logger.info(`Equipment catalogue updated: ${ecuname} [${ecuuid}]`);
        break;
      }
      case 'equipment.catalogue.deactivated': {
        const { catalogueId: ecdid, brand: ecdbrand, model: ecdmodel, reason } = event.payload as any;
        logger.info(`Equipment catalogue deactivated: ${ecdbrand} ${ecdmodel} reason=${reason} [${ecdid}]`);
        break;
      }
      case 'equipment.catalogue.restored': {
        const { catalogueId: ecrid, brand: ecrbrand, model: ecrmodel } = event.payload as any;
        logger.info(`Equipment catalogue restored: ${ecrbrand} ${ecrmodel} [${ecrid}]`);
        break;
      }
      // Equipment inventory events
      case 'equipment.inventory.created': {
        const { inventoryId: eiid, serialNumber: eisn, status: eistat } = event.payload as any;
        logger.info(`Equipment inventory created: ${eisn} status=${eistat} [${eiid}]`);
        break;
      }
      case 'equipment.inventory.updated': {
        const { inventoryId: eiuid, serialNumber: eiusn, changedFields } = event.payload as any;
        logger.info(`Equipment inventory updated: ${eiusn} fields=[${changedFields?.join(', ')}] [${eiuid}]`);
        break;
      }
      case 'equipment.inventory.status.changed': {
        const { inventoryId: eiscid, serialNumber: eiscsn, fromStatus: eiscfrom, toStatus: eiscto } = event.payload as any;
        logger.info(`Equipment inventory status changed: ${eiscsn} ${eiscfrom}→${eiscto} [${eiscid}]`);
        break;
      }
      case 'equipment.inventory.deactivated': {
        const { inventoryId: eidid, serialNumber: eidsn, reason: eidr } = event.payload as any;
        logger.info(`Equipment inventory deactivated: ${eidsn} reason=${eidr} [${eidid}]`);
        break;
      }
      case 'equipment.inventory.restored': {
        const { inventoryId: eirid, serialNumber: eirsn } = event.payload as any;
        logger.info(`Equipment inventory restored: ${eirsn} [${eirid}]`);
        break;
      }
      // Maintenance job events
      case 'maintenance.job.scheduled': {
        const { jobId: mjsid, serialNumber: mjssn, type: mjstype } = event.payload as any;
        logger.info(`Maintenance job scheduled: ${mjstype} for ${mjssn} [${mjsid}]`);
        break;
      }
      case 'maintenance.job.started': {
        const { jobId: mjstid, serialNumber: mjstsn } = event.payload as any;
        logger.info(`Maintenance job started: ${mjstsn} [${mjstid}]`);
        break;
      }
      case 'maintenance.job.completed': {
        const { jobId: mjcid, serialNumber: mjcsn, totalCost: mjccost } = event.payload as any;
        logger.info(`Maintenance job completed: ${mjcsn} cost=\u20B9${mjccost} [${mjcid}]`);
        break;
      }
      case 'maintenance.job.cancelled': {
        const { jobId: mjcanid, serialNumber: mjcansn, reason: mjcanr } = event.payload as any;
        logger.info(`Maintenance job cancelled: ${mjcansn} reason=${mjcanr} [${mjcanid}]`);
        break;
      }
      case 'maintenance.job.failed': {
        const { jobId: mjfid, serialNumber: mjfsn, reason: mjfr } = event.payload as any;
        logger.info(`Maintenance job failed: ${mjfsn} reason=${mjfr} [${mjfid}]`);
        break;
      }
      default:
        logger.warn(`Unknown billing event: ${event.eventName}`);
    }
  });
}