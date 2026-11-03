import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { RoastMe } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("RoastMe Smart Contract", function () {
  let roastMe: RoastMe;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let charlie: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();
    const RoastMeFactory = await ethers.getContractFactory("RoastMe");
    roastMe = (await RoastMeFactory.deploy()) as RoastMe;
    await roastMe.waitForDeployment();
  });

  describe("Profile Creation", function () {
    it("should allow a user to create a profile", async function () {
      await expect(roastMe.connect(alice).createProfile("Alice", "Crypto enthusiast and builder"))
        .to.emit(roastMe, "ProfileCreated")
        .withArgs(alice.address, "Alice", "Crypto enthusiast and builder");

      const profile = await roastMe.getProfile(alice.address);
      expect(profile.displayName).to.equal("Alice");
      expect(profile.bio).to.equal("Crypto enthusiast and builder");
      expect(profile.exists).to.be.true;
      expect(profile.feedbackEnabled).to.be.true;
      expect(profile.totalFeedback).to.equal(0n);
      expect(profile.sumRatings).to.equal(0n);
    });

    it("should revert if user attempts to create a duplicate profile", async function () {
      await roastMe.connect(alice).createProfile("Alice", "Bio");
      await expect(
        roastMe.connect(alice).createProfile("Alice Again", "Another bio")
      ).to.be.revertedWithCustomError(roastMe, "ProfileAlreadyExists");
    });

    it("should revert if display name is empty or exceeds length limit", async function () {
      await expect(
        roastMe.connect(alice).createProfile("", "Bio")
      ).to.be.revertedWithCustomError(roastMe, "InvalidNameLength");

      const longName = "A".repeat(51);
      await expect(
        roastMe.connect(alice).createProfile(longName, "Bio")
      ).to.be.revertedWithCustomError(roastMe, "InvalidNameLength");
    });

    it("should revert if bio exceeds 120 characters", async function () {
      const longBio = "B".repeat(121);
      await expect(
        roastMe.connect(alice).createProfile("Alice", longBio)
      ).to.be.revertedWithCustomError(roastMe, "InvalidBioLength");
    });
  });

  describe("Profile Updates", function () {
    beforeEach(async function () {
      await roastMe.connect(alice).createProfile("Alice", "Original bio");
    });

    it("should allow profile owner to update their profile", async function () {
      await expect(roastMe.connect(alice).updateProfile("Alice 2.0", "Updated bio"))
        .to.emit(roastMe, "ProfileUpdated")
        .withArgs(alice.address, "Alice 2.0", "Updated bio");

      const profile = await roastMe.getProfile(alice.address);
      expect(profile.displayName).to.equal("Alice 2.0");
      expect(profile.bio).to.equal("Updated bio");
    });

    it("should revert if a user without a profile attempts to update", async function () {
      await expect(
        roastMe.connect(bob).updateProfile("Bob", "Bio")
      ).to.be.revertedWithCustomError(roastMe, "ProfileDoesNotExist");
    });

    it("should enforce validation limits on updates", async function () {
      await expect(
        roastMe.connect(alice).updateProfile("", "Bio")
      ).to.be.revertedWithCustomError(roastMe, "InvalidNameLength");

      const longBio = "C".repeat(121);
      await expect(
        roastMe.connect(alice).updateProfile("Alice", longBio)
      ).to.be.revertedWithCustomError(roastMe, "InvalidBioLength");
    });
  });

  describe("Feedback Controls (Enable / Disable)", function () {
    beforeEach(async function () {
      await roastMe.connect(alice).createProfile("Alice", "Bio");
    });

    it("should allow profile owner to toggle feedback status", async function () {
      await expect(roastMe.connect(alice).setFeedbackStatus(false))
        .to.emit(roastMe, "FeedbackStatusChanged")
        .withArgs(alice.address, false);

      let profile = await roastMe.getProfile(alice.address);
      expect(profile.feedbackEnabled).to.be.false;

      await expect(roastMe.connect(alice).setFeedbackStatus(true))
        .to.emit(roastMe, "FeedbackStatusChanged")
        .withArgs(alice.address, true);

      profile = await roastMe.getProfile(alice.address);
      expect(profile.feedbackEnabled).to.be.true;
    });

    it("should prevent feedback submissions when feedback is disabled", async function () {
      await roastMe.connect(alice).setFeedbackStatus(false);

      await expect(
        roastMe.connect(bob).submitFeedback(alice.address, 5, "Great work!")
      ).to.be.revertedWithCustomError(roastMe, "FeedbackDisabled");
    });

    it("should revert if non-existent profile toggles feedback status", async function () {
      await expect(
        roastMe.connect(bob).setFeedbackStatus(false)
      ).to.be.revertedWithCustomError(roastMe, "ProfileDoesNotExist");
    });
  });

  describe("Feedback Submission", function () {
    beforeEach(async function () {
      await roastMe.connect(alice).createProfile("Alice", "Web3 Explorer");
    });

    it("should allow a visitor to submit feedback", async function () {
      await expect(roastMe.connect(bob).submitFeedback(alice.address, 4, "Loved the presentation!"))
        .to.emit(roastMe, "FeedbackSubmitted");

      const feedbacks = await roastMe.getFeedback(alice.address);
      expect(feedbacks.length).to.equal(1);
      expect(feedbacks[0].sender).to.equal(bob.address);
      expect(feedbacks[0].rating).to.equal(4);
      expect(feedbacks[0].message).to.equal("Loved the presentation!");

      const total = await roastMe.getTotalFeedback(alice.address);
      expect(total).to.equal(1n);

      const hasSubmitted = await roastMe.hasUserGivenFeedback(alice.address, bob.address);
      expect(hasSubmitted).to.be.true;
    });

    it("should revert if user attempts to rate their own profile", async function () {
      await expect(
        roastMe.connect(alice).submitFeedback(alice.address, 5, "I am awesome")
      ).to.be.revertedWithCustomError(roastMe, "CannotRateOwnProfile");
    });

    it("should revert if target profile does not exist", async function () {
      await expect(
        roastMe.connect(bob).submitFeedback(charlie.address, 5, "Hello")
      ).to.be.revertedWithCustomError(roastMe, "ProfileDoesNotExist");
    });

    it("should revert if rating is invalid (less than 1 or greater than 5)", async function () {
      await expect(
        roastMe.connect(bob).submitFeedback(alice.address, 0, "Too low")
      ).to.be.revertedWithCustomError(roastMe, "InvalidRating");

      await expect(
        roastMe.connect(bob).submitFeedback(alice.address, 6, "Too high")
      ).to.be.revertedWithCustomError(roastMe, "InvalidRating");
    });

    it("should revert if feedback message is empty or exceeds 280 characters", async function () {
      await expect(
        roastMe.connect(bob).submitFeedback(alice.address, 5, "")
      ).to.be.revertedWithCustomError(roastMe, "InvalidMessageLength");

      const longMsg = "R".repeat(281);
      await expect(
        roastMe.connect(bob).submitFeedback(alice.address, 5, longMsg)
      ).to.be.revertedWithCustomError(roastMe, "InvalidMessageLength");
    });

    it("should revert if a wallet submits duplicate feedback to the same profile", async function () {
      await roastMe.connect(bob).submitFeedback(alice.address, 5, "First feedback");

      await expect(
        roastMe.connect(bob).submitFeedback(alice.address, 4, "Second feedback")
      ).to.be.revertedWithCustomError(roastMe, "FeedbackAlreadySubmitted");
    });
  });

  describe("Rating Calculations and Aggregation", function () {
    beforeEach(async function () {
      await roastMe.connect(alice).createProfile("Alice", "Bio");
    });

    it("should calculate average rating accurately (scaled by 100)", async function () {
      // Initially 0
      expect(await roastMe.getAverageRating(alice.address)).to.equal(0n);

      // Bob rates 5
      await roastMe.connect(bob).submitFeedback(alice.address, 5, "5 stars!");
      // 5 * 100 / 1 = 500
      expect(await roastMe.getAverageRating(alice.address)).to.equal(500n);

      // Charlie rates 4
      await roastMe.connect(charlie).submitFeedback(alice.address, 4, "4 stars!");
      // (5 + 4) * 100 / 2 = 450 (4.50)
      expect(await roastMe.getAverageRating(alice.address)).to.equal(450n);

      // Owner rates 2
      await roastMe.connect(owner).submitFeedback(alice.address, 2, "Needs roast!");
      // (5 + 4 + 2) * 100 / 3 = 1100 / 3 = 366 (3.66)
      expect(await roastMe.getAverageRating(alice.address)).to.equal(366n);

      expect(await roastMe.getTotalFeedback(alice.address)).to.equal(3n);
    });

    it("should return all profile addresses accurately", async function () {
      await roastMe.connect(bob).createProfile("Bob", "Bob's bio");
      const list = await roastMe.getAllProfiles();
      expect(list).to.include(alice.address);
      expect(list).to.include(bob.address);
      expect(await roastMe.totalProfilesCount()).to.equal(2n);
    });
  });
});
