export const CAMERA_TYPES = ['BMD URSA G2', 'Panasonic', 'BMD Micro', 'BMD Studio', 'Sony FX6', 'Sony FX3'];
export const LENSES = ['Fuji UA23', 'Fuji HA23', 'Fuji HA14', 'Fuji UA14', 'Fuji Xa20', 'Fuji LA16', 'G X Vario PZ 14-42'];
export const PURPOSES = ['Main', 'Close-Up', 'LG', 'RG', 'LOS', 'ROS', 'LP', 'RP', 'Reverse', 'Handheld', 'Drone', 'LBG', 'RBG', 'Wide Beauty', 'RRA', 'SSLM'];

export const PICTURES = [
  { id: 'broadcast', name: 'Broadcast Camera', file: '/assets/2.png' },
  { id: 'box', name: 'Box / Studio Camera', file: '/assets/12.png' },
  { id: 'longlens', name: 'Long Lens / Super Tele', file: '/assets/11.png' },
  { id: 'handheld', name: 'Handheld ENG', file: '/assets/5.png' },
  { id: 'gimbal', name: 'Gimbal / Steadicam', file: '/assets/6.png' },
  { id: 'micro', name: 'Micro / POV', file: '/assets/9.png' },
  { id: 'goal', name: 'Goal Cam', file: '/assets/1.png' },
  { id: 'beauty', name: 'Beauty Cam', file: '/assets/4.png' },
  { id: 'drone', name: 'Drone', file: '/assets/3.png' },
  { id: 'rf', name: 'RF / Wireless', file: '/assets/10.png' },
  { id: 'jib', name: 'Jib / Crane', file: '/assets/8.png' },
  { id: 'ref', name: 'Ref Cam', file: '/assets/7.png' },
  { id: 'lbg_alt', name: 'Low Behind Goal', file: '/assets/13.png' }
];

export const SPORT_PRESETS = {
  football: {
    id: 'football',
    name: 'Football',
    width: 1000,
    height: 562.5,
    background: '#2a8f4f'
  },
  basketball: {
    id: 'basketball',
    name: 'Basketball',
    width: 940,
    height: 500,
    background: '#d18443'
  },
  handball: {
    id: 'handball',
    name: 'Handball',
    width: 800,
    height: 400,
    background: '#3a78b5'
  }
};

export function createCamera(index = 0) {
  return {
    id: `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`,
    label: `CAM${index + 1}`,
    purpose: PURPOSES[0],
    cameraType: CAMERA_TYPES[0],
    lens: LENSES[0],
    picture: PICTURES[0].id,
    x: 50,
    y: 50,
    angle: 0,
    fov: 50,
    mirror: false,
    locked: false,
    loc: ''
  };
}

export function pictureInfo(id) {
  return PICTURES.find((p) => p.id === id) || PICTURES[0];
}
