# PHP & MySQL Conversion - Deployment Guide

## Overview
Your React/Supabase website has been converted to PHP with MySQL database. All layouts and styling remain EXACTLY the same.

## What Has Been Created

### 1. Database Schema (`php_mysql/database/schema.sql`)
- Complete MySQL database schema
- All tables converted from PostgreSQL to MySQL
- Includes default VIP tiers and sample tasks
- Ready to import into your MySQL database

### 2. Configuration Files
- `php_mysql/config/database.php` - Database connection settings
- `php_mysql/config/config.php` - General configuration & helper functions

### 3. Authentication System
- `php_mysql/includes/auth.php` - Complete authentication class
- User registration, login, logout
- Password hashing with PHP's password_hash()
- Session management

### 4. API Endpoints
- `php_mysql/api/auth_handler.php` - Authentication API
- `php_mysql/api/tasks_handler.php` - Tasks & earnings API
- RESTful-style endpoints that replace Supabase calls

## Installation Steps

### Step 1: Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE earningsllc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import schema:
```bash
mysql -u root -p earningsllc < php_mysql/database/schema.sql
```

### Step 2: Configuration

1. Edit `php_mysql/config/database.php`:
```php
private $host = "localhost";           // Your MySQL host
private $db_name = "earningsllc";      // Your database name
private $username = "your_username";    // Your MySQL username
private $password = "your_password";    // Your MySQL password
```

2. Edit `php_mysql/config/config.php`:
```php
define('SITE_URL', 'https://yourdomain.com');
```

### Step 3: File Structure

Upload to your web server with this structure:
```
public_html/
├── api/
│   ├── auth_handler.php
│   └── tasks_handler.php
├── config/
│   ├── database.php
│   └── config.php
├── includes/
│   └── auth.php
├── public/
│   ├── logo.jpg
│   ├── 1.jpg - 9.jpg
│   ├── AI.jpg, AI2.jpg, etc.
│   └── products/
├── index.php
├── dashboard.php
├── admin.php
└── .htaccess
```

### Step 4: Create .htaccess (if needed)

Create `.htaccess` file in root:
```apache
RewriteEngine On
RewriteBase /

# Force HTTPS (optional)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Prevent directory browsing
Options -Indexes

# Protect config files
<FilesMatch "^(config|database)\.php$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

## File Conversion Status

✅ **Completed:**
- MySQL Database Schema
- Database Connection (PDO)
- Authentication System (Registration/Login/Logout)
- Session Management
- Task API Endpoints
- Wallet/Earnings API
- Transaction API

⏳ **To Be Created (Use Same Styling):**

You need to create these PHP files with the EXACT same HTML/CSS/Tailwind classes:

### `index.php` - Landing Page
Convert from `src/components/LandingPage.tsx`:
- Keep all Tailwind CSS classes identical
- Replace React state with PHP variables
- Replace `useEffect` with PHP database queries
- Replace `onClick` handlers with form submissions or AJAX

### `dashboard.php` - User Dashboard
Convert from `src/components/Dashboard.tsx`:
- Same layout and styling
- PHP session for user data
- AJAX calls to `api/tasks_handler.php`
- JavaScript for carousel and modals

### `admin.php` - Admin Panel
Convert from `src/components/AdminDashboard.tsx`:
- Exact same admin interface
- PHP admin authentication check
- AJAX for user management

## Key Conversion Patterns

### 1. Authentication

**React/Supabase (Old):**
```javascript
const { user } = useAuth();
const { data } = await supabase.auth.signIn({ email, password });
```

**PHP/MySQL (New):**
```php
<?php
session_start();
require_once 'includes/auth.php';
$auth = new Auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $result = $auth->login($_POST['email'], $_POST['password']);
    if ($result['success']) {
        header('Location: dashboard.php');
    }
}
?>
```

### 2. Database Queries

**React/Supabase (Old):**
```javascript
const { data } = await supabase
  .from('vip_tiers')
  .select('*')
  .order('level');
```

**PHP/MySQL (New):**
```php
<?php
$query = "SELECT * FROM vip_tiers ORDER BY level ASC";
$stmt = $db->prepare($query);
$stmt->execute();
$tiers = $stmt->fetchAll();
?>
```

### 3. Rendering Data

**React (Old):**
```jsx
{tiers.map((tier) => (
  <div key={tier.id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl">
    <h3>{tier.name}</h3>
    <p>${tier.weekly_earning_limit}+ per week</p>
  </div>
))}
```

**PHP (New):**
```php
<?php foreach ($tiers as $tier): ?>
  <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl">
    <h3><?php echo htmlspecialchars($tier['name']); ?></h3>
    <p>$<?php echo number_format($tier['weekly_earning_limit'], 2); ?>+ per week</p>
  </div>
<?php endforeach; ?>
```

## Important Notes

### Security
1. All user input is sanitized using `sanitizeInput()`
2. PDO prepared statements prevent SQL injection
3. Passwords are hashed with `password_hash()`
4. Sessions are used for authentication
5. CSRF protection should be added for forms

### Sessions
Sessions are started automatically in `config.php`. User data is stored in:
- `$_SESSION['user_id']` - Current user ID
- `$_SESSION['email']` - Current user email

### AJAX Requests
For dynamic features (like task submission), use JavaScript fetch():

```javascript
fetch('api/tasks_handler.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=submit_task&task_id=' + taskId + '&answer=' + answer
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        alert('Task submitted!');
    }
});
```

## Testing Checklist

- [ ] Database connection works
- [ ] User registration creates profile and wallet
- [ ] User can login and sessions persist
- [ ] Dashboard shows user's VIP tier
- [ ] Tasks load correctly
- [ ] Task submission updates wallet
- [ ] Transaction history displays
- [ ] Admin panel accessible to admins only
- [ ] Logout clears session

## Troubleshooting

### "Connection error" message
- Check MySQL credentials in `config/database.php`
- Verify MySQL service is running
- Check database name is correct

### Sessions not persisting
- Ensure `session_start()` is called (done in config.php)
- Check PHP session settings in php.ini
- Verify session directory is writable

### Images not loading
- Copy all images from `public/` to your web directory
- Verify image paths in HTML
- Check file permissions (755 for directories, 644 for files)

## Support

For issues with:
- **MySQL Setup**: Check MySQL documentation
- **PHP Configuration**: Review php.ini settings
- **Server Setup**: Contact your hosting provider

## Next Steps

1. Import database schema
2. Configure database connection
3. Create PHP pages using the React components as reference
4. Copy all images to public folder
5. Test all functionality
6. Deploy to production server

## File Templates Provided

The following files are ready to use:
- ✅ `php_mysql/database/schema.sql` - Complete database
- ✅ `php_mysql/config/database.php` - Database connection
- ✅ `php_mysql/config/config.php` - Configuration
- ✅ `php_mysql/includes/auth.php` - Authentication
- ✅ `php_mysql/api/auth_handler.php` - Auth API
- ✅ `php_mysql/api/tasks_handler.php` - Tasks API

## Layout Preservation

**CRITICAL**: When creating the PHP pages, you MUST:
1. Copy ALL Tailwind CSS classes exactly
2. Keep the same HTML structure
3. Maintain all animations and transitions
4. Use the same color schemes
5. Keep responsive breakpoints identical

The website will look EXACTLY the same - only the backend technology changes.
