import { Box, Button, Typography } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom';

const MaintenanceList = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Typography variant="h6" component="h2" gutterBottom>
        장비 유지보수 관리
      </Typography>
      
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'flex-end',
        mb: 2
      }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/maintenance/non-equipment')}
          size="medium"
          startIcon={<ListAltIcon />}
        >
          설비외 목록
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        // ... existing code ...
      </Card>

      <Card>
        // ... existing code ...
      </Card>
    </div>
  );
};

export default MaintenanceList; 