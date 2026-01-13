# Product Brief: StreamDeck-Meet & Teams

**Role**: Product Manager
**Status**: Draft
**Last Updated**: 2026-01-09

## 1. Project Overview
StreamDeck-Meet (working title) is a Chrome Extension that integrates Elgato Stream Deck hardware with Google Meet and Microsoft Teams. It allows users to control their meeting status (mute, video, hand raise, etc.) using physical buttons on their Stream Deck device, leveraging the WebHID API for driverless communication. The goal is to provide a unified, consistent control experience across multiple meeting platforms.

## 2. Problem Statement
**The Problem**:
Users switching between Google Meet and Microsoft Teams often struggle with inconsistent interfaces and shortcut keys. Quickly muting/unmuting or toggling the camera requires finding the correct tab and navigating different UI layouts.
**The Pain**:
- Cognitive load of switching "muscle memory" between platforms.
- Fumbling for buttons during a presentation.
- "You're on mute" friction.
- Slow reaction time in critical meeting moments.

## 3. Target Audience
- **Primary**: Power users, remote workers, and presenters who use Google Meet or Microsoft Teams and own an Elgato Stream Deck.
- **Secondary**: Streamers or educators who manage complex hybrid meeting sessions.

## 4. User Stories
- **As a remote worker**, I want to mute my microphone by pressing a physical button so that I can cough or speak to someone in my room without disrupting the meeting.
- **As a presenter**, I want to see if I am muted by looking at my Stream Deck so that I don't speak while muted.
- **As a user**, I want to leave a meeting instantly with one press so that I don't linger awkwardly after saying goodbye.
- **As a user**, I want to join a meeting from the "Green Room" with one button press.

## 5. Key Features (MVP)
- **WebHID Integration**: Direct communication with Stream Deck (Mini, Original, XL, MK.2) without external native drivers.
- **Multi-Platform Support**:
    - **Google Meet**: `meet.google.com`
    - **Microsoft Teams**: `teams.microsoft.com` (Web Client)
- **Context Awareness**: Buttons update based on meeting state (Lobby, Green Room, In Meeting, Post Meeting) for both platforms.
- **Unified Core Controls**:
    - Mute/Unmute Mic
    - Enable/Disable Camera
    - Leave Meeting
    - Join Meeting (from Green Room/Lobby)
- **Visual Feedback**: Icons on the Stream Deck reflect the current state (e.g., specific icon for "Muted"), customized or unified across platforms.

## 6. Non-Functional Requirements
- **Performance**: The extension must inject scripts with minimal latency and negligible impact on the meeting platforms.
- **Security**: Must adhere to strict permissions (Manifest V3), requesting access only to `meet.google.com`, `teams.microsoft.com`, and HID devices.
- **Compatibility**: Support for major Stream Deck models (Original, Mini, XL, MK.2).
- **Usability**: Plug-and-play experience (WebHID "Connect" flow).

## 7. Success Metrics
- **Adoption**: Number of active installs.
- **Reliability**: Low rate of "device not found" or disconnection errors.
- **User Satisfaction**: 4.5+ star rating on Chrome Web Store.

## 8. Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+).
- **API**: WebHID API (Browser Native).
- **Platform**: Google Chrome Extension (Manifest V3).
