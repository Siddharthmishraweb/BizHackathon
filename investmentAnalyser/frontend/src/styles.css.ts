/**
 * Global styles for the application.
 */

export const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #fdf3f7;
    color: #333;
  }

  /* Axis Bank Maroon Theme */
  :root {
    --primary-blue: #97144d;
    --dark-blue: #6e0e3a;
    --light-blue: #fbeaf1;
    --accent-blue: #7a0e3c;
    --success: #28a745;
    --warning: #ffc107;
    --danger: #dc3545;
    --gray-light: #f8f9fa;
    --gray-dark: #6c757d;
    --border-color: #ddd;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 30px;
    margin: 20px 0;
  }

  .btn {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background-color: var(--primary-blue);
    color: white;
  }

  .btn-primary:hover {
    background-color: var(--dark-blue);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(151, 20, 77, 0.3);
  }

  .btn-secondary {
    background-color: var(--gray-light);
    color: var(--primary-blue);
    border: 2px solid var(--primary-blue);
  }

  .btn-secondary:hover {
    background-color: var(--light-blue);
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--dark-blue);
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(151, 20, 77, 0.1);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .error {
    color: var(--danger);
    font-size: 14px;
    margin-top: 5px;
  }

  .success {
    color: var(--success);
    font-size: 14px;
    margin-top: 5px;
  }

  .loading {
    text-align: center;
    padding: 40px;
    color: var(--primary-blue);
  }

  .loading::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-left: 10px;
    border: 3px solid rgba(151, 20, 77, 0.3);
    border-radius: 50%;
    border-top-color: var(--primary-blue);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  h1 {
    color: var(--dark-blue);
    margin-bottom: 10px;
  }

  h2 {
    color: var(--primary-blue);
    margin-bottom: 20px;
    border-bottom: 3px solid var(--light-blue);
    padding-bottom: 10px;
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }

    .card {
      padding: 20px;
    }
  }
`;
