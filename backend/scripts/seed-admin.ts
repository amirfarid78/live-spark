import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'livespark',
});

async function seedAdmin() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const email = 'admin@livespark.com';
    const password = 'Admin@123';
    const username = 'admin';

    // Check if admin already exists
    const existingUser = await AppDataSource.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.length > 0) {
      console.log('Admin user already exists, updating password...');
      const hashedPassword = await bcrypt.hash(password, 12);
      await AppDataSource.query(
        `UPDATE users SET password = $1, is_active = true WHERE email = $2`,
        [hashedPassword, email]
      );
      console.log('Admin password updated!');
    } else {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = uuidv4();

      // Create user
      await AppDataSource.query(
        `INSERT INTO users (id, email, password, is_active, email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, true, true, NOW(), NOW())`,
        [userId, email, hashedPassword]
      );

      // Create profile
      await AppDataSource.query(
        `INSERT INTO profiles (id, user_id, username, display_name, level, coins, diamonds, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'gold', 1000000, 1000000, NOW(), NOW())`,
        [uuidv4(), userId, username, 'Administrator']
      );

      // Assign admin role
      await AppDataSource.query(
        `INSERT INTO user_roles (id, user_id, role, created_at)
         VALUES ($1, $2, 'admin', NOW())`,
        [uuidv4(), userId]
      );

      console.log('Admin user created successfully!');
    }

    console.log('\n=================================');
    console.log('Admin Credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('=================================\n');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
