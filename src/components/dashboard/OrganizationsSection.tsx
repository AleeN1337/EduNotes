"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import { Business as BusinessIcon } from "@mui/icons-material";
import { OrganizationsSectionProps } from "./types";
import { useRouter } from "next/navigation";

export default function OrganizationsSection({
  userOrganizations,
  onCreateClick,
  onOrganizationClick,
}: OrganizationsSectionProps) {
  const router = useRouter();

  return (
    <Card
      sx={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        borderRadius: 3,
        border: "2px solid",
        borderColor: "primary.main",
        background:
          "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "primary.main",
                mb: 1,
              }}
            >
              🏢 Moje organizacje
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Zarządzaj grupami edukacyjnymi i współpracuj z innymi
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={onCreateClick}
            startIcon={<BusinessIcon />}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #667eea 60%, #764ba2 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Utwórz nową
          </Button>
        </Box>

        {userOrganizations && userOrganizations.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {userOrganizations.map((org, index) => (
              <Card
                key={index}
                onClick={() => router.push(`/organizations/${org.id}`)}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background:
                          "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      {org.organization_name?.charAt(0)?.toUpperCase() || "O"}
                    </Box>
                    <Chip
                      label={org.role === "owner" ? "Właściciel" : "Członek"}
                      color={org.role === "owner" ? "primary" : "default"}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {org.organization_name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Członek od{" "}
                    {org.joined_at
                      ? new Date(org.joined_at).toLocaleDateString("pl-PL")
                      : "Brak danych"}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Chip label="-- kanałów" size="small" variant="outlined" />
                    <Chip label="-- członków" size="small" variant="outlined" />
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 500,
                      "&:hover": {
                        background: "primary.main",
                        color: "white",
                      },
                    }}
                  >
                    Otwórz panel grupy →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              background: "rgba(0,0,0,0.02)",
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "32px",
              }}
            >
              🏢
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Brak organizacji
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
            >
              Nie należysz jeszcze do żadnej organizacji edukacyjnej. Utwórz
              nową lub poproś o zaproszenie do istniejącej grupy.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                onClick={onCreateClick}
                startIcon={<BusinessIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Utwórz organizację
              </Button>
              <Button
                variant="outlined"
                startIcon={<span>📧</span>}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Mam kod zaproszenia
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
