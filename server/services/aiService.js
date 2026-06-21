// Mock AI service - in production, you'd use actual APIs like OpenAI, Gemini, etc.
const aiService = {
  // Generate bio from interests and profession
  generateBio: async (interests, profession) => {
    const bios = [
      `Passionate ${profession} who loves ${interests.join(', ')}. Looking for someone to share adventures with!`,
      `${profession} by day, ${interests[0]} enthusiast by night. Seeking meaningful connections.`,
      `Hi! I'm a ${profession} who enjoys ${interests.join(' and ')}. Let's explore the world together!`
    ];
    const prompts = [
      "What's your favorite travel destination?",
      "If you could have any superpower, what would it be?",
      "What's the best piece of advice you've ever received?"
    ];
    const introductions = [
      "Hey! I noticed we both love some of the same things. Would love to chat!",
      "Hi there! Your profile caught my eye. Let's get to know each other!",
      "Hey! I think we'd get along great. Want to say hi?"
    ];
    return {
      bio: bios[Math.floor(Math.random() * bios.length)],
      prompts,
      introductions
    };
  },

  // Rate photos and suggest order
  ratePhotos: async (photos) => {
    return photos.map((url, index) => ({
      url,
      rating: Math.floor(Math.random() * 5) + 1,
      suggestion: index === 0 ? "Great main photo!" : "Consider moving this up!"
    })).sort((a, b) => b.rating - a.rating);
  },

  // Suggest date ideas based on location
  planDate: async (location) => {
    return {
      cafes: ["Cozy Corner Café", "Brew & Bean", "The Rustic Mug"],
      activities: ["Hiking", "Movie night", "Art gallery visit"],
      places: ["City Park", "Botanical Gardens", "Waterfront"],
      itinerary: [
        "10:00 AM - Coffee at Cozy Corner Café",
        "12:30 PM - Picnic at City Park",
        "3:00 PM - Visit to Art Gallery",
        "6:00 PM - Dinner at a nice restaurant"
      ]
    };
  },

  // Calculate love score
  calculateLoveScore: async (user1, user2) => {
    const loveTypes = ["Cosmic Explorer", "Romantic Dreamer", "Adventure Seeker", "Soulful Connector"];
    const score = Math.floor(Math.random() * 50) + 50;
    return {
      loveType: loveTypes[Math.floor(Math.random() * loveTypes.length)],
      romanticPercentage: score,
      shareable: true
    };
  }
};

module.exports = aiService;
