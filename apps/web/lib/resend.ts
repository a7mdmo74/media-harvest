// Mock email service - no external dependencies
export const resend = {
  emails: {
    send: async (data: any) => {
      console.log("Mock email sent:", data);
      return { id: "mock-email-id" };
    }
  }
};
