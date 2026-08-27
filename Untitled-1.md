```mermaid

flowchart TD
    subgraph Root["mediworks-b2b-mobile/"]
        APP["App.jsx"]
        ENV[".env"]
        APPJSON["app.json"]
        BABEL["babel.config.js"]
        PKG["package.json"]

        subgraph Assets["assets/"]
            ICON["icon.png"]
            SPLASH["splash.png"]
            ADAPTIVE["adaptive-icon.png"]
        end

        subgraph Src["src/"]
            subgraph Components["components/"]
                subgraph Common["common/"]
                    CT["CampoTexto.jsx"]
                    BP["BotonPrimario.jsx"]
                end
                subgraph Cards["cards/"]
                    TT["TarjetaTrabajador.jsx"]
                    EE["EtiquetaEstatus.jsx"]
                    VP["VisorPdfModal.jsx"]
                end
            end

            subgraph Features["features/"]
                subgraph Auth["auth/"]
                    LS["LoginScreen.jsx"]
                end
                subgraph Workers["workers/"]
                    LTS["ListaTrabajadoresScreen.jsx"]
                    ES["ExpedienteScreen.jsx"]
                end
                subgraph Studies["studies/"]
                    DES["DetalleEstudioScreen.jsx"]
                end
                subgraph Appointments["appointments/"]
                    ACS["AgendarCitaScreen.jsx"]
                end
            end

            subgraph Hooks["hooks/"]
                UA["useAuth.js"]
                UT["useTrabajadores.js"]
            end

            subgraph Nav["navigation/"]
                AN["AuthNavigator.jsx"]
                APPN["AppNavigator.jsx"]
            end

            subgraph Serv["services/"]
                API["api.js"]
                TS["trabajadoresService.js"]
            end

            subgraph Store["store/"]
                TC["TenantContext.js"]
            end

            subgraph Utils["utils/"]
                FMT["formatters.js"]
            end
        end
    end
    
    ```
