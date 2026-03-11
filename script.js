// Configuration
const USERNAME = 'krunalpatoliya7';
const API_URL = `https://api.github.com/users/${USERNAME}/repos`;

// Wait for the HTML document to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {
    fetchRepositories();
    setupFilters();
});

// A global variable to store all fetched projects so we can filter them later
let allProjects = [];

// 1. Fetch data from the GitHub API
async function fetchRepositories() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 2. Ignore forked repositories and sort by date descending
        allProjects = data
            .filter(repo => repo.fork === false)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // Display the initial list of all projects
        renderProjects(allProjects);
        
        // Hide loading state
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('github-projects-grid').classList.remove('hidden');
        
    } catch (error) {
        console.error("Failed to fetch GitHub projects:", error);
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('error-state').classList.remove('hidden');
    }
}

// 3. Render the project cards dynamically into the HTML
function renderProjects(projectsToRender) {
    const grid = document.getElementById('github-projects-grid');
    grid.innerHTML = ''; // Clear existing projects
    
    // If no projects match the filter, show a message
    if (projectsToRender.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">No projects found matching your search.</p>';
        return;
    }

    // Loop through each project and create an HTML card for it
    projectsToRender.forEach(repo => {
        // Format the date nicely
        const updatedDate = new Date(repo.updated_at).toLocaleDateString();
        
        // Get the primary language, or show "Unknown" if it's empty
        const language = repo.language ? repo.language : 'Unknown';
        
        // Try to provide a custom description if not available
        const getCustomDescription = (name) => {
            const descriptions = {
                'Portfolio': 'A personal data analyst portfolio website showcasing projects, skills, and interactive resume.',
                'ai-stock-direction-prediction': 'Machine learning model built with Python to predict the directional movement of stock prices using historical market data.',
                'Netflix_Project_Analysis': 'Comprehensive data analysis of Netflix\'s catalog exploring content trends, ratings, and genre distributions.',
                'SQL_Retail_Sales_Analysis-': 'SQL-based analysis of retail sales data to extract insights on revenue, top customers, and product performance.',
                'Pizza-Sales-Report': 'Data analysis and reporting focusing on pizza sales data to optimize operations and identify specific sales patterns.'
            };
            
            for (const [key, desc] of Object.entries(descriptions)) {
                if (name === key || name.startsWith(key)) return desc;
            }
            return 'No description provided.';
        };
        
        // Get the description, or use a custom one/default message
        const description = repo.description ? repo.description : getCustomDescription(repo.name);
        
        // Build the HTML for the card using the existing CSS classes for styling
        const cardHTML = `
            <div class="project-card glass-card hover-glow">
                <div class="project-content">
                    <h3>${repo.name}</h3>
                    <p class="project-desc">${description}</p>
                    <div class="project-tech">
                        <span class="tech-tag">${language}</span>
                    </div>
                    <div class="project-links">
                        <span class="project-date">Updated: ${updatedDate}</span>
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="github-link"><i class="fab fa-github"></i> Repository</a>
                    </div>
                </div>
            </div>
        `;
        
        // Add the card to the grid
        grid.innerHTML += cardHTML;
    });
}

// 4. Set up the Search and Technology filters
function setupFilters() {
    const searchInput = document.getElementById('repo-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // A helper function to apply both search text and button categories
    function filterProjects() {
        // Get the text from the search bar (lowercase for easy matching)
        const searchText = searchInput ? searchInput.value.toLowerCase() : '';
        
        // Get the currently active button category
        const activeButton = document.querySelector('.filter-btn.active');
        const categoryFilter = activeButton ? activeButton.getAttribute('data-filter').toLowerCase() : 'all';
        
        // Start filtering the main array
        const filteredList = allProjects.filter(repo => {
            // Prepare data for matching
            const name = (repo.name || '').toLowerCase();
            const desc = (repo.description || '').toLowerCase();
            const lang = (repo.language || '').toLowerCase();
            
            // Check if the project matches the typing in the search bar
            const matchesSearch = searchText === '' || name.includes(searchText) || desc.includes(searchText) || lang.includes(searchText);
            
            // Check if the project matches the active button category
            const matchesCategory = categoryFilter === 'all' || name.includes(categoryFilter) || desc.includes(categoryFilter) || lang.includes(categoryFilter);
            
            // Keep the project only if it matches BOTH the search bar AND the category button
            return matchesSearch && matchesCategory;
        });
        
        // Update the screen with the newly filtered list
        renderProjects(filteredList);
    }

    // Listen for typing in the search bar
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterProjects();
        });
    }

    // Listen for clicks on the technology buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add 'active' class to the clicked button
            button.classList.add('active');
            
            // Run the filter
            filterProjects();
        });
    });
}
