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

/* global BaseWrapper */

/**
 * Wrapper for Microsoft Teams (Web Client).
 * Handles detection of room state and maps options to Stream Deck buttons.
 */
class TeamsWrapper extends BaseWrapper {
  #currentRoom;

  #ROOM_NAMES = {
    unknown: 'unknown',
    lobby: 'lobby',
    meeting: 'meeting',
  };

  /**
   * Constructor
   *
   * @param {HIDDevice} streamDeck
   */
  constructor(streamDeck) {
    super(streamDeck);
    console.log('StreamDeck-Meet: TeamsWrapper initialized');

    this.#startObservers();
  }

  /**
   * Handle called when a button is pressed.
   *
   * @param {number} buttonId Button ID of the button that was pressed.
   */
  handleStreamDeckPress(buttonId) {
    super.handleStreamDeckPress(buttonId);
    console.log('*SD-Teams*', 'Button Pressed', buttonId);

    // Common controls (available in meeting)
    if (this.#currentRoom === this.#ROOM_NAMES.meeting) {
      if (buttonId === this._streamDeck.buttonNameToId('mic')) {
        this.#tapMic();
      } else if (buttonId === this._streamDeck.buttonNameToId('cam')) {
        this.#tapCam();
      } else if (buttonId === this._streamDeck.buttonNameToId('hand')) {
        this.#tapHand();
      } else if (buttonId === this._streamDeck.buttonNameToId('end-call')) {
        this.#tapHangUp();
      }
    }
  }

  /**
   * Start observing the DOM for room changes and state updates.
   */
  #startObservers() {
    const bodyObserver = new MutationObserver(() => {
      this.#detectRoom();
    });
    bodyObserver.observe(document.body, {attributes: true, childList: true, subtree: true});
    this.#detectRoom();
  }

  /**
   * Detect current room state (Lobby vs Meeting).
   */
  #detectRoom() {
    // Basic detection logic (Subject to change based on actual Teams DOM)
    // Meeting usually has a hangup button.
    if (document.querySelector('[data-tid="call-hangup"]')) {
      this.#enterMeeting();
    } else {
      // Improve lobby detection
      this.#currentRoom = this.#ROOM_NAMES.lobby;
      // Maybe clear buttons or show 'Join' if we can find it?
    }
  }

  /**
   * Enter meeting state.
   */
  #enterMeeting() {
    if (this.#currentRoom === this.#ROOM_NAMES.meeting) {
      return;
    }
    this.#currentRoom = this.#ROOM_NAMES.meeting;
    console.log('*SD-Teams*', 'Entered Meeting');
    
    this.resetButtons();
    this.drawFullScreenButton();
    this.drawButton('end-call');
    
    // Delayed setup for state observers
    setTimeout(() => {
      this.#setupMicButton();
      this.#setupCamButton();
      this.#setupHandButton();
    }, 1000);
  }

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *
   * Actions
   *
   */

  #tapMic() {
    const btn = this.#getMicButton();
    if (btn) btn.click();
  }

  #tapCam() {
    const btn = this.#getCamButton();
    if (btn) btn.click();
  }

  #tapHand() {
    const btn = this.#getHandButton();
    if (btn) btn.click();
  }

  #tapHangUp() {
    const btn = document.querySelector('[data-tid="call-hangup"]');
    if (btn) btn.click();
  }

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *
   * Selectors & Observers
   *
   */

  #getMicButton() {
    // Try data-tid first, then aria-label pattern
    return document.querySelector('[data-tid="mute-unmute-microphone"]') ||
           document.querySelector('button[aria-label*="mute microphone"]');
  }

  #getCamButton() {
    return document.querySelector('[data-tid="toggle-video"]') ||
           document.querySelector('button[aria-label*="turn camera"]');
  }

  #getHandButton() {
    return document.querySelector('[data-tid="raise-hand"]') ||
           document.querySelector('button[aria-label*="raise hand"]');
  }

  #setupMicButton() {
    const btn = this.#getMicButton();
    if (!btn) return;

    // Observer to update icon
    // Teams buttons usually change aria-pressed or aria-label when toggled.
    const observer = new MutationObserver(() => {
      this.#updateMicButton(btn);
    });
    observer.observe(btn, {attributes: true});
    this.#updateMicButton(btn);
  }

  #updateMicButton(btn) {
    const isMuted = btn.getAttribute('aria-pressed') === 'true' || // Sometimes pressed = muted?
                    btn.getAttribute('aria-label')?.includes('Unmute'); // If label says "Unmute", we are MUTED.
    
    // Logic might be inverted depending on Teams version.
    // If aria-pressed="true" usually means "Mic is ON" or "Button is Active".
    // For Mute button: Active usually means Muted? Or Active means Mic On?
    // Let's assume: If label says "Unmute microphone", we are currently MUTED.
    // If label says "Mute microphone", we are currently UNMUTED.
    
    const label = btn.getAttribute('aria-label') || '';
    const isUnmuted = label.toLowerCase().includes('mute microphone'); // Action is to mute -> we are unmuted.
    const img = isUnmuted ? 'mic' : 'mic-disabled';
    this.drawButton(img);
  }

  #setupCamButton() {
    const btn = this.#getCamButton();
    if (!btn) return;
    const observer = new MutationObserver(() => {
      this.#updateCamButton(btn);
    });
    observer.observe(btn, {attributes: true});
    this.#updateCamButton(btn);
  }

  #updateCamButton(btn) {
    const label = btn.getAttribute('aria-label') || '';
    const isCameraOn = label.toLowerCase().includes('turn off camera') || label.toLowerCase().includes('stop video');
    const img = isCameraOn ? 'cam' : 'cam-disabled';
    this.drawButton(img);
  }

  #setupHandButton() {
    const btn = this.#getHandButton();
    if (!btn) return;
    const observer = new MutationObserver(() => {
      this.#updateHandButton(btn);
    });
    observer.observe(btn, {attributes: true});
    this.#updateHandButton(btn);
  }

  #updateHandButton(btn) {
    const isRaised = btn.getAttribute('aria-pressed') === 'true';
    const img = isRaised ? 'hand-raised' : 'hand';
    this.drawButton(img);
  }
}
