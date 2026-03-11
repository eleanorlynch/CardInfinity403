import { Scene } from "phaser";
import { authorizeDiscordUser } from "../utils/discordSDK";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background");

    let authInProgress = false;

    let scaleX = this.cameras.main.width / bg.width + 0.2;
    let scaleY = this.cameras.main.height / bg.height + 0.2;
    let scale = Math.max(scaleX, scaleY);

    bg.setScale(scale).setScrollFactor(0);

    this.add.image(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.2, "infinity of spades").setScale(0.4);

    this.add
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.4, "Card Infinity", {
        fontFamily: "Arial Black",
        fontSize: "4.5rem",
        color: "#E9DFD9",
        stroke: "#101814",
        strokeThickness: 10,
        align: "center",
      })
      .setOrigin(0.5)
      .setShadow(3, 3, "#EBC9B3", 0, true, false);

    this.add.line(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.5,
      0, 0, Number(this.game.config.width) * 0.7, 0, 0xE9DFD9).setLineWidth(10);


    const mask_button_start_game = this.make
      .graphics({})
      .fillRoundedRect(Number(this.game.config.width) * 0.4, Number(this.game.config.height) * 0.55, 250, 75, 20)
      .createGeometryMask();

    const button_start_game = this.add
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.6, 'Start Game', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#101814',
        align: 'center',
        fixedWidth: 260,
        backgroundColor: '#EBC9B3'
      })
      .setPadding(32)
      .setOrigin(0.5)
      .setMask(mask_button_start_game);

    const mask_button_join_game = this.make
      .graphics({})
      .fillRoundedRect(Number(this.game.config.width) * 0.4, Number(this.game.config.height) * 0.67, 250, 75, 20)
      .createGeometryMask();

    const button_join_game = this.add
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.72, 'Join Game', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#101814',
        align: 'center',
        fixedWidth: 260,
        backgroundColor: '#EBC9B3'

      }).setPadding(32).setOrigin(0.5).setMask(mask_button_join_game);

    const mask_button_manage_rules = this.make
      .graphics({})
      .fillRoundedRect(Number(this.game.config.width) * 0.4, Number(this.game.config.height) * 0.79, 250, 75, 20)
      .createGeometryMask();

    const button_manage_rules = this.add
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.84, 'Manage Rules', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#101814',
        align: 'center',
        fixedWidth: 260,
        backgroundColor: '#EBC9B3'
      }).setPadding(32).setOrigin(0.5).setMask(mask_button_manage_rules);

    // Auth/debug feedback for Discord start failures.
    const authErrorText = this.add
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.93, "", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffb3b3",
        align: "center",
      })
      .setOrigin(0.5);

    button_start_game.setInteractive({ useHandCursor: true });

    button_start_game.on('pointerover', () => {
      button_start_game.setBackgroundColor('#8d8d8d');
    });

    button_start_game.on('pointerout', () => {
      button_start_game.setBackgroundColor('#EBC9B3');
    });

    button_start_game.on('pointerdown', async () => {
      if (authInProgress) return;
      authInProgress = true;
      authErrorText.setText("Authorizing with Discord...");
      try {
        await authorizeDiscordUser();
        this.scene.start("Game", { isHost: true });
      } catch (error) {
        console.error("Discord authorization failed:", error);
        const message = error instanceof Error ? error.message : "Unknown auth error";
        authErrorText.setText(`Discord auth failed: ${message}`);
        authInProgress = false;
      }
    });

    button_join_game.setInteractive({ useHandCursor: true });

    button_join_game.on('pointerover', () => {
      button_join_game.setBackgroundColor('#8d8d8d');
    });

    button_join_game.on('pointerout', () => {
      button_join_game.setBackgroundColor('#EBC9B3');
    });

    button_join_game.on('pointerdown', () => {
      if (authInProgress) return;

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter room code...';
      input.style.cssText = `
        font-size: 24px; padding: 12px 20px; border-radius: 8px;
        border: 2px solid #EBC9B3; background: #101814; color: #E9DFD9;
        text-align: center; outline: none; width: 240px;
      `;

      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); z-index: 999;
      `;

      const row = document.createElement('div');
      row.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        display: flex; align-items: center; gap: 10px; z-index: 1000;
      `;

      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = 'Join';
      confirmBtn.style.cssText = `
        font-size: 24px; padding: 12px 24px; border-radius: 8px; border: none;
        background: #EBC9B3; color: #101814; cursor: pointer; pointer-events: auto;
        flex-shrink: 0;
      `;

      const btnWrapper = document.createElement('div');
      btnWrapper.style.cssText = `display: flex; flex-direction: column; align-items: center; gap: 6px;`;

      const hint = document.createElement('div');
      hint.textContent = 'Enter to confirm  •  Esc to cancel';
      hint.style.cssText = `font-size: 13px; color: #E9DFD9; opacity: 0.7; white-space: nowrap;`;

      const errorLabel = document.createElement('div');
      errorLabel.style.cssText = `
        font-size: 14px; color: #ff7b7b; text-align: center;
        margin-top: 4px; display: none;
      `;

      confirmBtn.onmouseenter = () => { confirmBtn.style.background = '#8d8d8d'; };
      confirmBtn.onmouseleave = () => { confirmBtn.style.background = '#EBC9B3'; };

      btnWrapper.appendChild(confirmBtn);
      btnWrapper.appendChild(hint);
      btnWrapper.appendChild(errorLabel);
      row.appendChild(input);
      row.appendChild(btnWrapper);
      button_start_game.disableInteractive();
      button_join_game.disableInteractive();
      button_manage_rules.disableInteractive();

      document.body.appendChild(overlay);
      document.body.appendChild(row);
      input.focus();

      const cleanup = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(row);
        button_start_game.setInteractive({ useHandCursor: true });
        button_join_game.setInteractive({ useHandCursor: true });
        button_manage_rules.setInteractive({ useHandCursor: true });
      };

      const submit = async () => {
        const roomId = input.value.trim();
        if (!roomId) return;

        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Checking...';
        errorLabel.style.display = 'none';

        try {
          const res = await fetch(`/.proxy/api/room-exists/${encodeURIComponent(roomId)}`);
          const { exists, full } = await res.json();
          if (!exists || full) {
            input.value = '';
            input.placeholder = 'Enter room code...';
            errorLabel.textContent = full ? 'Room is full.' : 'Room not found. Check the code.';
            errorLabel.style.display = 'block';
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Join';
            return;
          }
        } catch {
          // If check fails, fall through and let Game scene handle it
        }

        cleanup();
        authInProgress = true;
        authErrorText.setText("Authorizing with Discord...");
        try {
          await authorizeDiscordUser();
          this.scene.start("Game", { isHost: false, roomId });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown auth error";
          authErrorText.setText(`Discord auth failed: ${message}`);
          authInProgress = false;
        }
      };

      confirmBtn.onclick = submit;
      overlay.onclick = cleanup;
      input.onkeydown = (e) => {
        if (e.key === 'Enter') submit();
        if (e.key === 'Escape') cleanup();
      };
    });

    button_manage_rules.setInteractive({ useHandCursor: true });

    button_manage_rules.on('pointerover', () => {
      button_manage_rules.setBackgroundColor('#8d8d8d');
    });

    button_manage_rules.on('pointerout', () => {
      button_manage_rules.setBackgroundColor('#EBC9B3');
    });

    button_manage_rules.on('pointerdown', async () => {
      try {
        await authorizeDiscordUser();
      } catch (error) {
        console.error("Discord auth failed (Manage Rules):", error);
      }
      this.scene.start("Rules");
    });

    // for testing in discord without authorized user
    // button_start_game.on('pointerdown', /*async*/ () => {
    // console.log("Start game clicked");
    // await authorizeDiscordUser();
    // console.log("Discord authorized");
    // this.scene.start("Game");
    // });
  }
}
