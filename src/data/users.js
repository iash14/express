let users = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    username: "user1",
    email: "user1@example.com",
    password: "password123",
    role: "user",
    createdAt: "2024-01-02T11:30:00Z"
  },
  {
    id: 3,
    username: "user2",
    email: "user2@example.com",
    password: "password456",
    role: "user",
    createdAt: "2024-01-03T14:20:00Z"
  }
];

const tokens = {};

const userModel = {
  getAll: () =>
    users.map(({ password, ...u }) => u),

  findById: (id) => {
    const user = users.find(u => u.id === Number(id));
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  },

  findByEmail: (email) =>
    users.find(u => u.email === email),

  create: (data) => {
    const id = Math.max(...users.map(u => u.id)) + 1;
    const newUser = {
      id,
      ...data,
      role: "user",
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    const { password, ...safe } = newUser;
    return safe;
  },

  update: (id, data) => {
    const i = users.findIndex(u => u.id === Number(id));
    if (i === -1) return null;
    users[i] = { ...users[i], ...data };
    const { password, ...safe } = users[i];
    return safe;
  },

  delete: (id) => {
    const i = users.findIndex(u => u.id === Number(id));
    if (i === -1) return false;
    users.splice(i, 1);
    return true;
  },

  checkPassword: (user, password) =>
    user.password === password,

  saveToken: (userId, token) => {
    tokens[userId] = token;
  },

  verifyToken: (token) => {
    const id = Object.keys(tokens).find(k => tokens[k] === token);
    return id ? userModel.findById(id) : null;
  }
};

module.exports = userModel;
