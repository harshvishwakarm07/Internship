const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({ req, action, entityType, entityId = '', metadata = {} }) => {
  try {
    await AuditLog.create({
      actor: req.user?._id || null,
      actorRole: req.user?.role || 'anonymous',
      action,
      entityType,
      entityId: entityId ? String(entityId) : '',
      metadata,
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || '',
    });
  } catch (_) {
    // Audit logs should never block business flow.
  }
};

module.exports = { createAuditLog };
