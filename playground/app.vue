<template>
  <div class="playground-container">
    <header class="header">
      <div class="header-content">
        <h1>🚀 Nuxt Ghost API Playground</h1>
        <p class="subtitle">
          Auto-generated RESTful CRUD APIs from your database schema
        </p>
      </div>
    </header>

    <main class="main-content">
      <!-- Introduction Section -->
      <section class="section intro-section">
        <h2>Welcome to the Playground!</h2>
        <p>
          This playground demonstrates the
          <strong>nuxt-auto-crud</strong> module in action. The module
          automatically generates RESTful CRUD APIs based on your database
          schema.
        </p>
        <p>
          Check out the <code>server/database/schema.ts</code> file to see the
          sample schema, and explore the auto-generated API endpoints below.
        </p>
      </section>

      <!-- Available Models Section -->
      <section class="section models-section">
        <h2>📋 Available Models</h2>
        <p>The following models are automatically detected from your schema:</p>
        <div class="models-grid">
          <div v-for="model in models" :key="model" class="model-card">
            <h3>{{ model }}</h3>
            <div class="endpoints">
              <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/{{ model }}</code>
                <span class="description">List all</span>
              </div>
              <div class="endpoint">
                <span class="method post">POST</span>
                <code>/api/{{ model }}</code>
                <span class="description">Create new</span>
              </div>
              <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/{{ model }}/:id</code>
                <span class="description">Get by ID</span>
              </div>
              <div class="endpoint">
                <span class="method patch">PATCH</span>
                <code>/api/{{ model }}/:id</code>
                <span class="description">Update</span>
              </div>
              <div class="endpoint">
                <span class="method delete">DELETE</span>
                <code>/api/{{ model }}/:id</code>
                <span class="description">Delete</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Start Section -->
      <section class="section quickstart-section">
        <h2>🚀 Quick Start</h2>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Install Dependencies</h3>
              <pre><code>bun install</code></pre>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Run the Playground</h3>
              <pre><code>bun run dev</code></pre>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Test the APIs</h3>
              <p>Use the examples below or your favorite API client!</p>
            </div>
          </div>
        </div>
      </section>

      <!-- API Examples Section -->
      <section class="section examples-section">
        <h2>💡 API Usage Examples</h2>

        <div class="example-card">
          <h3>Create a User</h3>
          <pre><code>// POST /api/users
const response = await $fetch('/api/users', {
  method: 'POST',
  body: {
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software developer'
  }
})</code></pre>
        </div>

        <div class="example-card">
          <h3>Get All Users</h3>
          <pre><code>// GET /api/users
const users = await $fetch('/api/users')</code></pre>
        </div>

        <div class="example-card">
          <h3>Get User by ID</h3>
          <pre><code>// GET /api/users/1
const user = await $fetch('/api/users/1')</code></pre>
        </div>

        <div class="example-card">
          <h3>Update a User</h3>
          <pre><code>// PATCH /api/users/1
const updated = await $fetch('/api/users/1', {
  method: 'PATCH',
  body: {
    bio: 'Updated bio'
  }
})</code></pre>
        </div>

        <div class="example-card">
          <h3>Delete a User</h3>
          <pre><code>// DELETE /api/users/1
await $fetch('/api/users/1', {
  method: 'DELETE'
})</code></pre>
        </div>
      </section>

      <!-- Features Section -->
      <section class="section features-section">
        <h2>✨ Features</h2>
        <div class="features-grid">
          <div class="feature">
            <div class="feature-icon">🔄</div>
            <h3>Auto-Detection</h3>
            <p>Automatically detects all tables from your Drizzle schema</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🛡️</div>
            <h3>Protected Fields</h3>
            <p>Automatically protects id and createdAt fields from updates</p>
          </div>
          <div class="feature">
            <div class="feature-icon">📝</div>
            <h3>Full CRUD</h3>
            <p>
              Complete Create, Read, Update, Delete operations out of the box
            </p>
          </div>
          <div class="feature">
            <div class="feature-icon">🎯</div>
            <h3>Type-Safe</h3>
            <p>Fully typed with TypeScript support</p>
          </div>
        </div>
      </section>

      <!-- Next Steps Section -->
      <section class="section next-steps-section">
        <h2>📚 Next Steps</h2>
        <ul>
          <li>
            Modify <code>server/database/schema.ts</code> to add your own tables
          </li>
          <li>
            Restart the dev server to see your new APIs automatically generated
          </li>
          <li>
            Check out the
            <a
              href="https://github.com/clifordpereira/nuxt-auto-crud"
              target="_blank"
              >GitHub repository</a
            >
            for more documentation
          </li>
          <li>
            Install in your own project: <code>bun add nuxt-auto-crud</code>
          </li>
        </ul>
      </section>
    </main>

    <footer class="footer">
      <p>
        Made with ❤️ by
        <a href="https://github.com/clifordpereira" target="_blank"
          >Cliford Pereira</a
        >
      </p>
    </footer>
  </div>
</template>

<script setup>
// Sample models from the schema
const models = ["users", "posts", "comments"];
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.playground-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  color: #333;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem 1rem;
  text-align: center;
}

.header-content h1 {
  margin: 0;
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0.5rem 0 0;
  font-size: 1.1rem;
  color: #666;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section h2 {
  margin-top: 0;
  color: #667eea;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.intro-section p {
  line-height: 1.6;
  color: #555;
  margin-bottom: 0.8rem;
}

.intro-section code {
  background: #f5f5f5;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  color: #667eea;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.model-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.model-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.model-card h3 {
  margin-top: 0;
  color: #764ba2;
  text-transform: capitalize;
  font-size: 1.3rem;
}

.endpoints {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.endpoint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0.5rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.method {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.75rem;
  min-width: 60px;
  text-align: center;
}

.method.get {
  background: #61affe;
  color: white;
}

.method.post {
  background: #49cc90;
  color: white;
}

.method.patch {
  background: #fca130;
  color: white;
}

.method.delete {
  background: #f93e3e;
  color: white;
}

.endpoint code {
  flex: 1;
  color: #333;
  font-size: 0.85rem;
}

.endpoint .description {
  color: #999;
  font-size: 0.8rem;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.step {
  display: flex;
  gap: 1rem;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h3 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1.1rem;
}

.step-content pre {
  background: #f5f5f5;
  padding: 0.8rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0;
}

.step-content code {
  font-family: "Courier New", monospace;
  color: #667eea;
}

.example-card {
  background: #f9f9f9;
  border-left: 4px solid #667eea;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

.example-card h3 {
  margin-top: 0;
  color: #764ba2;
  font-size: 1.2rem;
}

.example-card pre {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0;
}

.example-card code {
  font-family: "Courier New", monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.feature {
  text-align: center;
  padding: 1.5rem;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.feature h3 {
  margin: 0.5rem 0;
  color: #667eea;
  font-size: 1.1rem;
}

.feature p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.next-steps-section ul {
  line-height: 1.8;
  color: #555;
}

.next-steps-section code {
  background: #f5f5f5;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  color: #667eea;
}

.next-steps-section a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.next-steps-section a:hover {
  text-decoration: underline;
}

.footer {
  text-align: center;
  padding: 2rem;
  color: white;
}

.footer a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

.footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .header-content h1 {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .section {
    padding: 1.5rem;
  }

  .models-grid,
  .steps,
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
