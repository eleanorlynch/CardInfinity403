import 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_CLIENT_ID: string;
      CLIENT_SECRET: string;
      NODE_ENV: 'development' | 'production';
      PORT?: string;
      PWD: string;
    }
  }
}

declare module 'phaser' {
  interface Scene {
    rexUI: RexUIPlugin;
  }
}

export { };