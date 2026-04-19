INSERT OR IGNORE INTO roles (name, description) VALUES
('admin', 'Full access'),
('manager', 'Project editor and reviewer'),
('viewer', 'Read-only access');

INSERT OR IGNORE INTO permissions (code, description) VALUES
('projects:view', 'View projects'),
('projects:edit', 'Create and edit projects'),
('reference:manage', 'Manage reference tables'),
('users:manage', 'Manage users and roles');

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'admin';

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('projects:view', 'projects:edit') WHERE r.name = 'manager';

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('projects:view') WHERE r.name = 'viewer';

-- Password below is SHA-256('ChangeMe123!') for starter use only. Replace it before production.
INSERT OR IGNORE INTO users (name, email, password_hash, role_id)
SELECT 'Admin User', 'admin@planner.local', '9a4aabf0e5cf71cae2cea646613ce7e2a5919fa758e56819704be25a3a2c1f0b', r.idFROM roles r WHERE r.name = 'admin';

INSERT OR IGNORE INTO camera_types (name, sort_order) VALUES
('BMD URSA G2', 1),
('Panasonic', 2),
('BMD Micro', 3),
('BMD Studio', 4),
('Sony FX6', 5),
('Sony FX3', 6);

INSERT OR IGNORE INTO camera_purposes (name, sort_order) VALUES
('Main', 1), ('Close-Up', 2), ('LG', 3), ('RG', 4), ('LOS', 5), ('ROS', 6),
('LP', 7), ('RP', 8), ('Reverse', 9), ('Handheld', 10), ('Drone', 11),
('LBG', 12), ('RBG', 13), ('Wide Beauty', 14), ('RRA', 15), ('SSLM', 16);

INSERT OR IGNORE INTO lenses (name, sort_order) VALUES
('Fuji UA23', 1), ('Fuji HA23', 2), ('Fuji HA14', 3), ('Fuji UA14', 4),
('Fuji Xa20', 5), ('Fuji LA16', 6), ('G X Vario PZ 14-42', 7) , ('Box Lens');
