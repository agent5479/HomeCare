# Contributing to LarsBees

Thank you for your interest in contributing to LarsBees! 🐝

## How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, Python version, browser)

### Suggesting Features
1. Check if the feature has already been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use case / why it's needed
   - Possible implementation approach

### Code Contributions

#### Setup Development Environment
```bash
# Fork and clone the repo
git clone https://github.com/yourusername/LarsBees.git
cd LarsBees

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run setup
python setup.py

# Start development server
python app.py
```

#### Making Changes
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push to your fork
6. Create a Pull Request

#### Code Style
- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Update documentation if needed

#### Testing
- Test all new features manually
- Ensure existing functionality still works
- Test on different browsers if UI changes
- Test with and without Google Maps API key

### Pull Request Process
1. Update README.md if needed
2. Describe your changes clearly
3. Link related issues
4. Wait for review
5. Address any feedback

## Code of Conduct
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards other contributors

## Questions?
Feel free to open an issue for questions or discussions!

Thank you for contributing! 🍯

