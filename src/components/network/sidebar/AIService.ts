// Simple AI service to generate responses
// In a real implementation, this would be replaced with calls to an actual AI service

export class AIService {
  // Simple function to generate AI responses based on user input
  static generateAIResponse(userMessage: string, networkName?: string): string {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Suggestions for people to add
    if (lowerCaseMessage.includes('people') || lowerCaseMessage.includes('person') || lowerCaseMessage.includes('who')) {
      return `For your ${networkName || 'network'}, you might consider adding these people:\n\n1. **Sarah Johnson** - Marketing Director at TechCorp\n2. **Dr. Michael Chen** - AI Research Lead at University of Technology\n3. **Emma Rodriguez** - Community Organizer with connections to local businesses\n4. **James Wilson** - Venture Capitalist specializing in tech startups\n\nWould you like more specific suggestions based on a particular industry or role?`;
    }
    
    // Suggestions for organizations
    if (lowerCaseMessage.includes('organization') || lowerCaseMessage.includes('company') || lowerCaseMessage.includes('business')) {
      return `Here are some organizations that could enhance your ${networkName || 'network'}:\n\n1. **InnovateTech** - A startup accelerator with extensive industry connections\n2. **Global Research Institute** - Academic organization with research partnerships\n3. **Community Development Alliance** - Non-profit with strong local presence\n4. **Venture Partners LLC** - Investment firm focused on early-stage funding\n\nAre you looking for organizations in any specific sector?`;
    }
    
    // Suggestions for events
    if (lowerCaseMessage.includes('event') || lowerCaseMessage.includes('conference') || lowerCaseMessage.includes('meetup')) {
      return `Consider adding these events to your ${networkName || 'network'}:\n\n1. **Annual Tech Summit** - Major industry conference held every March\n2. **Networking Breakfast** - Monthly event for local professionals\n3. **Innovation Workshop** - Quarterly skill-building session\n4. **Industry Awards Gala** - Recognition event with high-profile attendees\n\nWould you like suggestions for virtual or in-person events?`;
    }
    
    // Suggestions for venues
    if (lowerCaseMessage.includes('venue') || lowerCaseMessage.includes('location') || lowerCaseMessage.includes('place')) {
      return `Here are some venues that might be valuable additions to your ${networkName || 'network'}:\n\n1. **Innovation Hub** - Co-working space with regular community events\n2. **Metropolitan Conference Center** - Hosts major industry gatherings\n3. **University Research Park** - Academic venue with industry partnerships\n4. **The Executive Club** - Exclusive meeting place for business leaders\n\nAre you interested in venues in a specific location?`;
    }
    
    // General enhancement suggestions
    return `To enhance your ${networkName || 'network'}, consider these additions:\n\n**People:**\n- Industry thought leaders\n- Community connectors\n- Subject matter experts\n- Decision makers\n\n**Organizations:**\n- Industry associations\n- Educational institutions\n- Funding sources\n- Partner businesses\n\n**Events:**\n- Regular networking opportunities\n- Knowledge-sharing workshops\n- Industry conferences\n- Community gatherings\n\nWhat specific aspect of your network would you like to develop further?`;
  }

  // Simulate an asynchronous AI response
  static async getResponse(message: string, networkName?: string): Promise<string> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.generateAIResponse(message, networkName));
      }, 1500); // 1.5 second delay to simulate API call
    });
  }
} 