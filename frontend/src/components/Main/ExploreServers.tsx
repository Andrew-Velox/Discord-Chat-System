import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import { useParams } from "react-router-dom";
import useCrud from "../../hooks/useCrud";
import { useEffect } from "react";
import { MEDIA_URL } from "../../config";
import { Link } from "react-router-dom";

interface Server {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  banner: string;
}

const ExploreServers = () => {
  const { categoryName } = useParams();
  const url = categoryName
    ? `/server/select/?category=${categoryName}`
    : "/server/select";
  const { dataCRUD, fetchData } = useCrud<Server>([], url);

  useEffect(() => {
    fetchData();
  }, [categoryName]);

  return (
    <>
      <Container maxWidth="lg">
        <Box sx={{ pt: 6 }}>
          <Typography
            variant="h3"
            noWrap
            component="h1"
            sx={{
              display: {
                sm: "block",
                fontWeight: 700,
                letterSpacing: "-2px",
                textTransform: "capitalize",
              },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {categoryName ? categoryName : "Popular Channels"}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="h6"
            noWrap
            component="h2"
            color="textSecondary"
            sx={{
              display: {
                sm: "block",
                fontWeight: 700,
                letterSpacing: "-1px",
              },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {categoryName
              ? `Channels talking about ${categoryName}`
              : "Check out some of our popular channels"}
          </Typography>
        </Box>

        <Typography
          variant="h6"
          sx={{ pt: 6, pb: 1, fontWeight: 700, letterSpacing: "-1px" }}
        >
          Recommended Channels
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 2 }}>
          {dataCRUD.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={6} lg={3}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "none",
                  backgroundImage: "none",
                  borderRadius: 0,
                  mb: { xs: 2, sm: 0 }, // Add margin bottom for mobile
                }}
              >
                <Link
                  to={`/server/${item.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <CardMedia
                    component="img"
                    image={
                      item.banner
                        ? `${MEDIA_URL}${item.banner}`
                        : "https://picsum.photos/300/200?random=1"
                    }
                    alt="random"
                    sx={{ 
                      display: { xs: "none", sm: "block" },
                      height: 200,
                      width: "100%",
                      objectFit: 'cover'
                    }}
                  />
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: { xs: 2, sm: 0 }, // Add padding for mobile
                      "&:last-child": { paddingBottom: { xs: 2, sm: 0 } },
                    }}
                  >
                    <List sx={{ py: { xs: 1, sm: 0 } }}>
                      <ListItem 
                        disablePadding={false}
                        sx={{ 
                          py: { xs: 1, sm: 0 },
                          px: { xs: 1, sm: 0 }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0 }}>
                          <ListItemAvatar sx={{ minWidth: "50px" }}>
                            <Avatar
                              alt="server Icon"
                              src={`${MEDIA_URL}${item.icon}`}
                            />
                          </ListItemAvatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              textAlign="start"
                              sx={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                fontWeight: 700,
                                ml: 1, // Add margin left for mobile
                              }}
                            >
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Typography 
                              variant="body2"
                              sx={{ ml: 1 }} // Add margin left for mobile
                            >
                              {item.category}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default ExploreServers;
