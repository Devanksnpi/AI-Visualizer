const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class SessionService {
  async getChatSessions() {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch chat sessions');
      }

      return data.sessions;
    } catch (error) {
      throw error;
    }
  }

  async createChatSession(title = 'New Chat') {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create chat session');
      }

      return data.session;
    } catch (error) {
      throw error;
    }
  }

  async getChatSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch chat session');
      }

      return data.session;
    } catch (error) {
      throw error;
    }
  }

  async updateChatSession(sessionId, title) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update chat session');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteChatSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete chat session');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getQuestions(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/questions?sessionId=${sessionId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch questions');
      }

      return data.questions;
    } catch (error) {
      throw error;
    }
  }

  async submitQuestion(sessionId, question) {
    try {
      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit question');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

const sessionService = new SessionService();
export default sessionService;
