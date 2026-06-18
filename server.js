require('dotenv').config();

const { connect } = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 3000;

connect().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
