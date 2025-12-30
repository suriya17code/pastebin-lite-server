import React, { useState } from 'react';
import {
    Container, TextField, Button, Typography, Box, Paper,
    Alert, CircularProgress, InputAdornment
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { createPaste, resetCreatedPaste } from '../store/slices/pasteSlice';

const CreatePaste: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { createdPaste, loading, error } = useSelector((state: RootState) => state.paste);

    const [content, setContent] = useState('');
    const [ttl, setTtl] = useState('');
    const [maxViews, setMaxViews] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(resetCreatedPaste());

        const ttlNum = ttl ? parseInt(ttl, 10) : undefined;
        const maxViewsNum = maxViews ? parseInt(maxViews, 10) : undefined;

        await dispatch(createPaste({
            content,
            ttl_seconds: ttlNum,
            max_views: maxViewsNum
        }));
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, background: 'linear-gradient(145deg, #1e1e1e, #2d2d2d)' }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#90caf9' }}>
                    Pastebin-Lite
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Share text with optional expiration and view limits.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Paste Content"
                        multiline
                        rows={6}
                        fullWidth
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        variant="outlined"
                        placeholder="Enter your confidential text here..."
                    />

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            label="TTL (Seconds)"
                            type="number"
                            value={ttl}
                            onChange={(e) => setTtl(e.target.value)}
                            helperText="Optional: Expires after seconds"
                            InputProps={{
                                endAdornment: <InputAdornment position="end">sec</InputAdornment>,
                            }}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Max Views"
                            type="number"
                            value={maxViews}
                            onChange={(e) => setMaxViews(e.target.value)}
                            helperText="Optional: Expires after views"
                            sx={{ flex: 1 }}
                        />
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create Paste'}
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mt: 3 }}>
                        {error}
                    </Alert>
                )}

                {createdPaste && (
                    <Alert severity="success" sx={{ mt: 3, wordBreak: 'break-all' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Paste Created!</Typography>
                        Share this URL: <a href={createdPaste.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{createdPaste.url}</a>
                    </Alert>
                )}
            </Paper>
        </Container>
    );
};

export default CreatePaste;
