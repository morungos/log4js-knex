let db = null;

function __setMockConnection(value) {
  db = value;
}

const generator = jest.fn(() => db);
generator.__setMockConnection = __setMockConnection;

module.exports = generator;