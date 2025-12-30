import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchPaste } from '../store/slices/pasteSlice';

const ViewPaste: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentPaste, loading, error } = useSelector((state: RootState) => state.paste);

    useEffect(() => {
        if (id) {
            dispatch(fetchPaste(id));
        }
    }, [dispatch, id]);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!currentPaste) {
        return null;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom color="primary">
                    View Paste
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', color: '#000', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {currentPaste.content}
                </Paper>
                <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                    Created at: {currentPaste.expires_at ? `Expires: ${new Date(currentPaste.expires_at).toLocaleString()}` : 'No Expiry'}
                    {currentPaste.remaining_views !== undefined && ` | Remaining Views: ${currentPaste.remaining_views}`}
                </Typography>
            </Paper>
        </Container>
    );
};

export default ViewPaste;
