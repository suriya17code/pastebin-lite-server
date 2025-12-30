import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { postService, CreatePasteDTO, PasteResponse, GetPasteResponse } from '../../services/post-service';

interface PasteState {
  currentPaste: GetPasteResponse | null;
  createdPaste: PasteResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: PasteState = {
  currentPaste: null,
  createdPaste: null,
  loading: false,
  error: null,
};

export const createPaste = createAsyncThunk(
  'paste/create',
  async (data: CreatePasteDTO, { rejectWithValue }) => {
    try {
      const response = await postService.createPaste(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create paste');
      // Note: backend returns { error: 'message' } 
    }
  }
);

export const fetchPaste = createAsyncThunk(
  'paste/fetch',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await postService.getPaste(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch paste');
    }
  }
);

const pasteSlice = createSlice({
  name: 'paste',
  initialState,
  reducers: {
    resetCreatedPaste: (state) => {
      state.createdPaste = null;
      state.error = null;
    },
    resetCurrentPaste: (state) => {
        state.currentPaste = null;
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Create Paste
    builder.addCase(createPaste.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createPaste.fulfilled, (state, action: PayloadAction<PasteResponse>) => {
      state.loading = false;
      state.createdPaste = action.payload;
    });
    builder.addCase(createPaste.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Paste
    builder.addCase(fetchPaste.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.currentPaste = null;
    });
    builder.addCase(fetchPaste.fulfilled, (state, action: PayloadAction<GetPasteResponse>) => {
      state.loading = false;
      state.currentPaste = action.payload;
    });
    builder.addCase(fetchPaste.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.currentPaste = null;
    });
  },
});

export const { resetCreatedPaste, resetCurrentPaste } = pasteSlice.actions;
export default pasteSlice.reducer;
