/*
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Base class for meeting platform wrappers.
 * Handles common Stream Deck interactions and generic features like Full Screen.
 */
class BaseWrapper { // eslint-disable-line
  _streamDeck;

  /**
   * Constructor
   *
   * @param {HIDDevice} streamDeck
   */
  constructor(streamDeck) {
    this._streamDeck = streamDeck;
    this._streamDeck.addEventListener('keydown', (evt) => {
      this.handleStreamDeckPress(evt.detail.buttonId);
    });

    window.addEventListener('fullscreenchange', () => {
      this.drawFullScreenButton();
    });
  }

  /**
   * Handle called when a button is pressed.
   * Should be overridden by subclasses to handle platform-specific buttons.
   *
   * @param {number} buttonId Button ID of the button that was pressed.
   */
  handleStreamDeckPress(buttonId) {
    // Toggle full screen, used in all rooms/platforms.
    if (buttonId === this._streamDeck.buttonNameToId('fullscreen-on')) {
      this.toggleFullScreen();
      return;
    }
  }

  /**
   * Draw an icon on the StreamDeck. Uses the current configuration to
   * determine which button to use based on the icon name.
   *
   * @param {string} iconName Name of icon to draw
   */
  drawButton(iconName) {
    if (!this._streamDeck?.isConnected) {
      return;
    }
    const buttonId = this._streamDeck.buttonNameToId(iconName);
    if (buttonId === undefined || buttonId < 0) {
      console.warn('*SD-Base*', `drawButton failed, unknown icon name: '${iconName}'`);
      return; // Not defined in the current configuration.
    }
    const iconURL = chrome.runtime.getURL(`ico-svg/${iconName}.svg`);
    this._streamDeck.fillURL(buttonId, iconURL, true);
  }

  /**
   * Clear the StreamDeck
   */
  resetButtons() {
    if (!this._streamDeck?.isConnected) {
      return;
    }
    this._streamDeck.clearAllButtons();
  }

  /**
   * Draw buttons for full screen toggle.
   */
  drawFullScreenButton() {
    if (document.fullscreenElement) {
      this.drawButton(`fullscreen-on`);
      return;
    }
    if (!navigator.userActivation.isActive) {
      this.drawButton(`fullscreen-disabled`);
      return;
    }
    this.drawButton(`fullscreen-off`);
  }

  /**
   * Toggles the tab between full screen and regular.
   */
  async toggleFullScreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.body.requestFullscreen();
      }
    } catch (ex) {
      // Cannot do fullscreen, disable the button.
      this.drawButton(`fullscreen-disabled`);
    }
  }
}
