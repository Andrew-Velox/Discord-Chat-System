import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Main = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: `${theme.primaryAppBar.height}px`,
        height: `calc(100vh - ${theme.primaryAppBar.height}px)`,
        overflow: "hidden",
      }}
    >
      {[...Array(115)].map((_, index) => (
        <Typography key={index} paragraph>
          {index + 1}
        </Typography>
      ))}
    </Box>
  );
};

export default Main;
