# Troubleshooting Guide

## Common Issues and Solutions

### Interview Not Starting

**Symptoms**:
- Clicking "Start Interview" does nothing
- Page freezes or shows loading indefinitely
- Error message appears

**Solutions**:
1. Check if Ollama is running: `ollama serve`
2. Verify the model is installed: `ollama list`
3. Check console for errors (F12 > Console)
4. Refresh the page and try again
5. Clear browser cache and cookies

### AI Not Responding

**Symptoms**:
- Interview started but AI doesn't reply
- Typing a message gets no response
- Connection seems lost

**Solutions**:
1. Check Ollama service status
2. Verify OpenAI API key if using fallback
3. Check network connection
4. Wait a moment - first response may take longer
5. Try ending and starting a new interview

### Slow Performance

**Symptoms**:
- Long delays between responses
- Page feels sluggish
- Loading spinners everywhere

**Solutions**:
1. Close other browser tabs
2. Check if Ollama is running locally (faster than OpenAI)
3. Use a simpler LLM model
4. Check system resources (RAM, CPU)
5. Restart the Ollama service

### Score Not Showing

**Symptoms**:
- Interview ended but no score
- Score shows as "N/A"
- Missing analytics data

**Solutions**:
1. Make sure interview was properly ended
2. Wait for scoring to complete
3. Refresh the dashboard
4. Check the History page for the interview
5. Try ending the interview again

### Login Issues

**Symptoms**:
- Can't log in with correct credentials
- Session expires immediately
- Redirected to login repeatedly

**Solutions**:
1. Check email and password spelling
2. Clear browser cookies
3. Try incognito/private mode
4. Reset password if forgotten
5. Check if account exists

### Resume Upload Failing

**Symptoms**:
- Upload button doesn't work
- File rejected
- Analysis doesn't complete

**Solutions**:
1. Check file format (PDF, DOC, DOCX only)
2. Ensure file size is under 10MB
3. Try a different browser
4. Convert to PDF and retry
5. Check file isn't corrupted

### Charts Not Loading

**Symptoms**:
- Blank chart areas
- "No data" message incorrectly shown
- Charts render incorrectly

**Solutions**:
1. Complete at least one interview for data
2. Refresh the page
3. Clear browser cache
4. Update browser to latest version
5. Try a different browser

### Coding Editor Issues

**Symptoms**:
- Code not running
- Syntax highlighting broken
- Can't type in editor

**Solutions**:
1. Refresh the page
2. Clear browser cache
3. Disable browser extensions
4. Try a different language
5. Check for JavaScript errors

## Error Messages

### "No LLM provider available"
- Ollama is not running AND OpenAI key is missing
- Start Ollama: `ollama serve`
- Or add OPENAI_API_KEY to .env

### "Interview not found"
- Interview was deleted or doesn't exist
- Check History for available interviews
- Start a new interview

### "Unauthorized"
- Session expired
- Log in again
- Check if cookies are enabled

### "Failed to fetch"
- Network error
- Backend server not running
- Check internet connection

### "Rate limit exceeded"
- Too many requests
- Wait a few minutes
- Reduce request frequency

## Getting Help

If problems persist:
1. Check console for error details (F12)
2. Review server logs
3. Restart all services
4. Check GitHub issues for known problems
5. Report new issues with:
   - Steps to reproduce
   - Error messages
   - Browser and OS info
   - Screenshots if helpful

## System Requirements

### Minimum
- Modern browser (Chrome, Firefox, Safari, Edge)
- 4GB RAM
- Stable internet connection

### Recommended
- 8GB+ RAM for running Ollama locally
- SSD storage
- Good CPU for faster AI responses

### For Local LLM (Ollama)
- 8GB RAM minimum
- 16GB+ recommended for larger models
- macOS, Linux, or Windows
