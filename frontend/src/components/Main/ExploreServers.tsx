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
import Container from "@mui/material/Container";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import { useParams } from "react-router-dom";
import usePublicCrud from "../../hooks/usePublicCrud";
import { useEffect, useState } from "react";
import { MEDIA_URL, BASE_URL } from "../../config";
import { Link } from "react-router-dom";
import axios from "axios";

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
    ? `/api/server/select/?category=${categoryName}`
    : "/api/server/select";
  
  console.log("ExploreServers: Component rendered with categoryName:", categoryName);
  console.log("ExploreServers: Generated URL:", url);
  
  const { dataCRUD, fetchData } = usePublicCrud<Server>([], url);
  const [directData, setDirectData] = useState<Server[]>([]);

  // Direct API test
  useEffect(() => {
    console.log("Direct API test starting...");
    axios.get(`${BASE_URL}${url}`)
      .then(response => {
        console.log("Direct API test success:", response.data);
        setDirectData(response.data);
      })
      .catch(error => {
        console.error("Direct API test failed:", error);
      });
  }, [url]);

  const displayData = directData.length > 0 ? directData : dataCRUD;

  useEffect(() => {
    console.log("ExploreServers: Fetching data from:", url);
    console.log("ExploreServers: BASE_URL:", BASE_URL);
    fetchData().catch(error => {
      console.error("ExploreServers: Error fetching data:", error);
      console.error("ExploreServers: Full URL:", `${BASE_URL}${url}`);
      // Don't re-throw the error, let the component continue with whatever data it has
    });
  }, [categoryName, fetchData]);

  useEffect(() => {
    console.log("ExploreServers: Hook data updated:", dataCRUD);
    console.log("ExploreServers: Direct data updated:", directData);
  }, [dataCRUD, directData]);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <Container 
        maxWidth="lg"
        sx={{
          height: { xs: '100vh', sm: 'auto' },
          overflowY: { xs: 'auto', sm: 'visible' },
          pb: { xs: 4, sm: 0 },
          px: { xs: 1, sm: 2, md: 3 },
          width: '100%',
          maxWidth: { xs: '100vw', sm: '100%' }
        }}
      >
        <Box sx={{ pt: { xs: 2, sm: 6 } }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              display: "block",
              fontWeight: 700,
              letterSpacing: "-2px",
              textTransform: "capitalize",
              textAlign: { xs: "center", sm: "left" },
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
              wordWrap: 'break-word',
              whiteSpace: 'normal'
            }}
          >
            {categoryName ? categoryName : "Popular Channels"}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="h6"
            component="h2"
            color="textSecondary"
            sx={{
              display: "block",
              fontWeight: 700,
              letterSpacing: "-1px",
              textAlign: { xs: "center", sm: "left" },
              fontSize: { xs: '1rem', sm: '1.25rem' },
              wordWrap: 'break-word',
              whiteSpace: 'normal',
              px: { xs: 1, sm: 0 }
            }}
          >
            {categoryName
              ? `Channels talking about ${categoryName}`
              : "Check out some of our popular channels"}
          </Typography>
        </Box>

        <Typography
          variant="h6"
          sx={{ 
            pt: { xs: 3, sm: 6 }, 
            pb: 1, 
            fontWeight: 700, 
            letterSpacing: "-1px",
            textAlign: { xs: "center", sm: "left" },
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            px: { xs: 1, sm: 0 }
          }}
        >
          Recommended Channels
        </Typography>
        <Box 
          sx={{
            display: { xs: 'block', sm: 'grid' },
            gridTemplateColumns: {
              sm: 'repeat(auto-fit, minmax(300px, 1fr))',
              md: 'repeat(auto-fit, minmax(320px, 1fr))',
              lg: 'repeat(4, 1fr)'
            },
            gap: { xs: 1, sm: 1.5, md: 2 },
            maxHeight: { xs: 'calc(100vh - 160px)', sm: 'none' },
            overflowY: { xs: 'auto', sm: 'visible' },
            overflowX: { xs: 'hidden', sm: 'visible' },
            pb: { xs: 2, sm: 0 },
            px: { xs: 0, sm: 0 },
            width: '100%',
            boxSizing: 'border-box',
            
            // Mobile: Stack vertically with proper spacing
            '& > *': {
              xs: {
                marginBottom: 1,
                width: '100%'
              }
            }
          }}
        >
          {displayData.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No servers found. Hook data length: {dataCRUD.length}, Direct data length: {directData.length}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                URL: {url}
              </Typography>
            </Box>
          ) : (
            displayData.map((item) => (
              <Box 
                key={item.id}
                sx={{
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  mb: { xs: 2, sm: 0 }
                }}
              >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "none",
                  backgroundImage: "none",
                  borderRadius: { xs: 1, sm: 0 },
                  mb: { xs: 1, sm: 0 },
                  maxWidth: "100%",
                  overflow: "hidden",
                  width: '100%'
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
                      display: { xs: "block", sm: "block" },
                      height: { xs: 150, sm: 180, md: 200 },
                      width: "100%",
                      objectFit: 'cover',
                      maxWidth: '100%'
                    }}
                  />
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: { xs: 1.5, sm: 2 },
                      "&:last-child": { paddingBottom: { xs: 1.5, sm: 2 } },
                    }}
                  >
                    <List sx={{ py: { xs: 0.5, sm: 0 } }}>
                      <ListItem 
                        disablePadding={false}
                        sx={{ 
                          py: { xs: 0.5, sm: 0 },
                          px: { xs: 0, sm: 0 },
                          flexWrap: { xs: 'wrap', sm: 'nowrap' }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: { xs: 35, sm: 40 } }}>
                          <ListItemAvatar sx={{ 
                            minWidth: { xs: "35px", sm: "50px" },
                            mr: { xs: 0.5, sm: 1 }
                          }}>
                            <Avatar
                              alt="server Icon"
                              src={item.icon ? `${MEDIA_URL}${item.icon}` : undefined}
                              sx={{
                                width: { xs: 35, sm: 40 },
                                height: { xs: 35, sm: 40 }
                              }}
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
                                whiteSpace: { xs: "normal", sm: "nowrap" },
                                fontWeight: 700,
                                ml: { xs: 0.5, sm: 1 },
                                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                                lineHeight: { xs: 1.2, sm: 1.43 }
                              }}
                            >
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Typography 
                              variant="body2"
                              sx={{ 
                                ml: { xs: 0.5, sm: 1 },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                opacity: 0.8
                              }}
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
            </Box>
          )))}
        </Box>
      </Container>
    </Box>
  );
};

export default ExploreServers;
