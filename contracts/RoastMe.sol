// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RoastMe
 * @notice On-chain feedback and rating platform where users create profiles and receive feedback.
 */
contract RoastMe {
    // --- Custom Errors ---
    error ProfileAlreadyExists();
    error ProfileDoesNotExist();
    error InvalidNameLength();
    error InvalidBioLength();
    error CannotRateOwnProfile();
    error FeedbackDisabled();
    error InvalidRating();
    error InvalidMessageLength();
    error FeedbackAlreadySubmitted();

    // --- Structs ---
    struct Profile {
        string displayName;
        string bio;
        bool exists;
        bool feedbackEnabled;
        uint256 createdAt;
        uint256 totalFeedback;
        uint256 sumRatings;
    }

    struct Feedback {
        address sender;
        uint8 rating;
        string message;
        uint256 timestamp;
    }

    // --- State Variables ---
    // User address => Profile data
    mapping(address => Profile) public profiles;

    // User address => Array of feedback received
    mapping(address => Feedback[]) private profileFeedbacks;

    // Target user address => Sender address => has submitted feedback
    mapping(address => mapping(address => bool)) public hasGivenFeedback;

    // List of registered profile addresses for discovery/directory
    address[] public profileAddresses;

    // --- Events ---
    event ProfileCreated(address indexed user, string displayName, string bio);
    event ProfileUpdated(address indexed user, string displayName, string bio);
    event FeedbackSubmitted(
        address indexed targetUser,
        address indexed sender,
        uint8 rating,
        string message,
        uint256 timestamp
    );
    event FeedbackStatusChanged(address indexed user, bool enabled);

    // --- Profile Management ---

    /**
     * @notice Create a new profile for msg.sender.
     * @param _displayName Display name (1 - 50 characters).
     * @param _bio Short bio (0 - 120 characters).
     */
    function createProfile(string calldata _displayName, string calldata _bio) external {
        if (profiles[msg.sender].exists) {
            revert ProfileAlreadyExists();
        }
        bytes memory nameBytes = bytes(_displayName);
        if (nameBytes.length == 0 || nameBytes.length > 50) {
            revert InvalidNameLength();
        }
        if (bytes(_bio).length > 120) {
            revert InvalidBioLength();
        }

        profiles[msg.sender] = Profile({
            displayName: _displayName,
            bio: _bio,
            exists: true,
            feedbackEnabled: true,
            createdAt: block.timestamp,
            totalFeedback: 0,
            sumRatings: 0
        });

        profileAddresses.push(msg.sender);

        emit ProfileCreated(msg.sender, _displayName, _bio);
    }

    /**
     * @notice Update display name and bio for msg.sender's existing profile.
     * @param _displayName Updated display name (1 - 50 characters).
     * @param _bio Updated short bio (0 - 120 characters).
     */
    function updateProfile(string calldata _displayName, string calldata _bio) external {
        if (!profiles[msg.sender].exists) {
            revert ProfileDoesNotExist();
        }
        bytes memory nameBytes = bytes(_displayName);
        if (nameBytes.length == 0 || nameBytes.length > 50) {
            revert InvalidNameLength();
        }
        if (bytes(_bio).length > 120) {
            revert InvalidBioLength();
        }

        Profile storage p = profiles[msg.sender];
        p.displayName = _displayName;
        p.bio = _bio;

        emit ProfileUpdated(msg.sender, _displayName, _bio);
    }

    /**
     * @notice Enable or disable incoming feedback for msg.sender's profile.
     * @param _enabled True to allow submissions, false to pause.
     */
    function setFeedbackStatus(bool _enabled) external {
        if (!profiles[msg.sender].exists) {
            revert ProfileDoesNotExist();
        }

        profiles[msg.sender].feedbackEnabled = _enabled;

        emit FeedbackStatusChanged(msg.sender, _enabled);
    }

    // --- Feedback Submission ---

    /**
     * @notice Submit a feedback review and star rating to a target profile.
     * @param _targetUser Address of the profile receiving feedback.
     * @param _rating Rating between 1 and 5.
     * @param _message Feedback message (1 - 280 characters).
     */
    function submitFeedback(
        address _targetUser,
        uint8 _rating,
        string calldata _message
    ) external {
        if (_targetUser == msg.sender) {
            revert CannotRateOwnProfile();
        }
        if (!profiles[_targetUser].exists) {
            revert ProfileDoesNotExist();
        }
        if (!profiles[_targetUser].feedbackEnabled) {
            revert FeedbackDisabled();
        }
        if (_rating < 1 || _rating > 5) {
            revert InvalidRating();
        }
        bytes memory messageBytes = bytes(_message);
        if (messageBytes.length == 0 || messageBytes.length > 280) {
            revert InvalidMessageLength();
        }
        if (hasGivenFeedback[_targetUser][msg.sender]) {
            revert FeedbackAlreadySubmitted();
        }

        hasGivenFeedback[_targetUser][msg.sender] = true;

        Feedback memory fb = Feedback({
            sender: msg.sender,
            rating: _rating,
            message: _message,
            timestamp: block.timestamp
        });

        profileFeedbacks[_targetUser].push(fb);

        Profile storage targetProfile = profiles[_targetUser];
        targetProfile.totalFeedback += 1;
        targetProfile.sumRatings += _rating;

        emit FeedbackSubmitted(_targetUser, msg.sender, _rating, _message, block.timestamp);
    }

    // --- View Functions ---

    /**
     * @notice Get profile information.
     * @param _user Address of the profile.
     */
    function getProfile(address _user) external view returns (Profile memory) {
        return profiles[_user];
    }

    /**
     * @notice Get all feedback submitted for a profile.
     * @param _user Address of the profile.
     */
    function getFeedback(address _user) external view returns (Feedback[] memory) {
        return profileFeedbacks[_user];
    }

    /**
     * @notice Get the average rating scaled by 100 (e.g. 450 = 4.5 stars).
     * @param _user Address of the profile.
     * @return Scaled average rating (0 to 500).
     */
    function getAverageRating(address _user) public view returns (uint256) {
        Profile storage p = profiles[_user];
        if (p.totalFeedback == 0) {
            return 0;
        }
        return (p.sumRatings * 100) / p.totalFeedback;
    }

    /**
     * @notice Get the total count of feedback for a profile.
     * @param _user Address of the profile.
     */
    function getTotalFeedback(address _user) external view returns (uint256) {
        return profiles[_user].totalFeedback;
    }

    /**
     * @notice Check if a sender has already submitted feedback to a target profile.
     */
    function hasUserGivenFeedback(address _targetUser, address _sender) external view returns (bool) {
        return hasGivenFeedback[_targetUser][_sender];
    }

    /**
     * @notice Get all registered profile addresses.
     */
    function getAllProfiles() external view returns (address[] memory) {
        return profileAddresses;
    }

    /**
     * @notice Total number of registered profiles.
     */
    function totalProfilesCount() external view returns (uint256) {
        return profileAddresses.length;
    }
}

