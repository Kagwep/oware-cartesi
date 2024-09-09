import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Scene,
  SceneLoader,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
  Mesh,
  PBRMaterial,
  PhysicsImpostor,
  VertexData,
  BoundingInfo,
  BabylonFileLoaderConfiguration,
  HavokPlugin,
  PhysicsViewer,
  TransformNode,
  PhysicsAggregate,
  PhysicsShapeType,
  VertexBuffer,
  DynamicTexture,
  CannonJSPlugin,
  Tools,
  CreateTextShapePaths,
  Texture,
  ISceneLoaderAsyncResult
} from "@babylonjs/core"
import { AdvancedDynamicTexture, Button, Control, InputText, Rectangle, StackPanel, TextBlock } from '@babylonjs/gui/2D';
import "@babylonjs/loaders/glTF";
import { Challenge } from '../../utils/types';
import * as CANNON from 'cannon';
import HavokPhysics from '@babylonjs/havok';
import { formattedAddressCheck, inspect, sendInput } from '../../utils';
import { v4 as uuidv4 } from 'uuid';
import { useAccount } from 'wagmi';
import { useToast } from '@chakra-ui/react';
import { useWriteInputBoxAddInput } from "../../hooks/generated";
import { fetchGraphQLData } from '../../utils/api';
import { NOTICES_QUERY } from '../../utils/query';
import { hexToString } from 'viem';
// import sphereTexture from "../../../assets/nuttexture3.avif";
 import { useChallenge } from '../../hooks/useChallenges';
import { useNavigate } from 'react-router-dom';
import { shortenAddress } from '../../utils';
import { GameInfoDisplay } from './GameInfoDisplay';
import { useTournament } from '../../hooks/useTournaments';

BabylonFileLoaderConfiguration.LoaderInjectedPhysicsEngine = CANNON ;
window.CANNON = CANNON;


interface GameMeshes {
    board: AbstractMesh | null;
    houses: AbstractMesh[];
    houseDisplays: AbstractMesh[];
    playerNames: {
      player1: AbstractMesh | null;
      player2: AbstractMesh | null;
    };
    playerTurnDisplays: {
      display1: AbstractMesh | null;
      display2: AbstractMesh | null;
    };
    capturedHouses: {
      captured1: AbstractMesh | null;
      captured2: AbstractMesh | null;
    };
    capturedDisplays: {
      home1: AbstractMesh | null;
      home2: AbstractMesh | null;
    };
    [key: string]: AbstractMesh | AbstractMesh[] | null | object;
  }
  
// before you start judging - I din't have enough time to cleanup
const OwareGame = ({ initialChallengeInfo,selectedTournamentId }: {initialChallengeInfo: Challenge, selectedTournamentId: string | null}) => {

    

    const [challengeInfo, setChallengeInfo] = useState<Challenge>(initialChallengeInfo);
    const { challenge, isLoading, error, refetch } = useChallenge(challengeInfo.challenge_id,selectedTournamentId);
    const tourn = useTournament(selectedTournamentId)
    const [isPolling, setIsPolling] = useState(false);

    const canvasRef = useRef(null);

    const navigate = useNavigate();

    const toast = useToast();

    const {writeContractAsync} = useWriteInputBoxAddInput();

    const gameMeshesRef = useRef<GameMeshes>({
        board: null,
        houses: [],
        houseDisplays: [],
        playerNames: { player1: null, player2: null },
        playerTurnDisplays: { display1: null, display2: null },
        capturedHouses: { captured1: null, captured2: null },
        capturedDisplays: { home1: null, home2: null },
      });

      const sceneRef = useRef<Scene | undefined>(undefined);
      const engineRef = useRef(null);

      const highlightedHouseRef = useRef<number | null>(null);
      const originalMaterialRef = useRef<StandardMaterial | null>(null);
      const gameInfoPanelRef = useRef<StackPanel| null>(null);
      const guiContainerRef = useRef<Rectangle| null>(null);
      const statusTextRef = useRef<TextBlock | null>(null);
      const addPlayerInfoTextRef = useRef<TextBlock | null>(null);
      const addInfoTextRef = useRef<TextBlock | null>(null);
      const advancedTextureRef = useRef<AdvancedDynamicTexture| null>(null);
      const addedSpheresRef = useRef<Mesh[]>([]);
      const capturedSpheresRef = useRef<Mesh[]>([]);
      const addedSpheres: Mesh[] = [];
      const capturedSpheres: Mesh[] = [];
      const gameInfoDisplayRef = useRef<GameInfoDisplay | null>(null);
      

      let sphere_count: number  = 1;

      const { address } = useAccount();

      const lowerHouses = ['House1', 'House2', 'House3', 'House4', 'House5', 'House6'];
      const upperHouses = ['House7', 'House8', 'House9', 'House10', 'House11', 'House12'];



    useEffect(() => {
        if (canvasRef.current) {

            const engine = new Engine(canvasRef.current, true);
            const scene = new Scene(engine);

            const physicsPlugin = new CannonJSPlugin();
            scene.enablePhysics(null, physicsPlugin);
            scene.collisionsEnabled = true;

            scene.fogMode = Scene.FOGMODE_EXP;
            scene.fogColor = new Color3(0.14, 0.39, 0.4);
            scene.fogDensity = 0.01;

            const skyDome = MeshBuilder.CreateSphere("skyDome", {diameter:10000, segments:32}, scene);
            const skyMaterial = new StandardMaterial("skyMaterial", scene);
            skyMaterial.backFaceCulling = false;
            skyMaterial.disableLighting = true;
            skyMaterial.emissiveTexture = new Texture("sky2.jpg", scene);
            skyDome.material = skyMaterial;

            // Camera setup
            const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 15, Vector3.Zero(), scene);
            camera.attachControl(canvasRef.current, true);
            camera.checkCollisions = true

            // Camera constraints
            camera.lowerBetaLimit = Math.PI/8 ;  // Limit downward rotation
            camera.upperBetaLimit = Math.PI / 2.2;  // Limit upward rotation
            camera.lowerRadiusLimit = 2;  // Limit zoom in
            camera.upperRadiusLimit = 2;  // Limit zoom out

            // Limit camera rotation around the vertical axis
            camera.lowerAlphaLimit = Math.PI ;
            camera.upperAlphaLimit = -Math.PI / 2;

            camera.panningSensibility = 0;

    

            SceneLoader.ImportMeshAsync("", "/models/", `board.glb`, scene).then((result) => {
     
              if (sceneRef.current) {
                  //cleanupGameState();
                  setGameState(scene, camera,result);
              }
          });

           
            sceneRef.current = scene;

            
            // Light
           let light =  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

           light.intensity = 0.7

        
            engine.runRenderLoop(() => {
                scene.render();
               // cleanupGameState()
            });

            const handleResize = () => {
                engine.resize();
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                engine.dispose();
            };
        }
    }, []);

    useEffect(() => {

        if(sceneRef.current && gameMeshesRef.current.houses.length > 0 && gameMeshesRef.current.houseDisplays.length > 0 ){
          createSeedsAndUpdateDisplays(challengeInfo.state);
        
          //Set up house picking
        setupHousePicking();
    
        updatePlayerTurnDisplays(gameMeshesRef.current.playerTurnDisplays)

        if (gameMeshesRef.current.capturedDisplays["home1"] && gameMeshesRef.current.capturedDisplays["home2"]) {
     
          const isPlayerScreenOwner1 = address && formattedAddressCheck(challengeInfo.player_one_captured.address, address);

          function getPlayerData(isPlayer1: boolean | undefined) {
              return isPlayer1 ? challengeInfo.player_one_captured : challengeInfo.player_two_captured;
          }
          
          function updateHomeDisplay(mesh: AbstractMesh, isOwnHome: boolean) {
              const playerData = getPlayerData(isPlayerScreenOwner1);
              const opponentData = getPlayerData(!isPlayerScreenOwner1);
              const dataToDisplay = isOwnHome ? playerData : opponentData;
              updateHouseCapturedDisplay(mesh, dataToDisplay.captured.toString());
          }
          
          updateHomeDisplay(gameMeshesRef.current.capturedDisplays["home1"],false);
          updateHomeDisplay(gameMeshesRef.current.capturedDisplays["home2"],true);
      }

      if (gameMeshesRef.current.capturedHouses["captured1"] && gameMeshesRef.current.capturedHouses["captured2"]) {

        const isPlayerScreenOwner1 = address && formattedAddressCheck(challengeInfo.player_one_captured.address, address);

        function getPlayerCaptured(isPlayer1: boolean | undefined) {
            return isPlayer1 ? challengeInfo.player_one_captured.captured : challengeInfo.player_two_captured.captured;
        }

        function updatePlayerCapturedDisplay(mesh: AbstractMesh, isClosestToScreen: boolean) {
            const screenOwnerCaptured = getPlayerCaptured(isPlayerScreenOwner1);
            const opponentCaptured = getPlayerCaptured(!isPlayerScreenOwner1);
            const capturedToDisplay = isClosestToScreen ? screenOwnerCaptured : opponentCaptured;

            if (capturedToDisplay > 0){
                for (let i = 0; i < capturedToDisplay; i++) {
                    addSphereInsideMesh(mesh,`seedNamec${sphere_count}`,sphere_count,true,false);
                    sphere_count += 1
                 }
                
            }
        }

        updatePlayerCapturedDisplay(gameMeshesRef.current.capturedHouses["captured1"], false);
        updatePlayerCapturedDisplay(gameMeshesRef.current.capturedHouses["captured2"], true);
         

    } 

    if(gameInfoDisplayRef.current){
      gameInfoDisplayRef.current.updateGameInfo(challengeInfo);
    }
    
        }

    },[challengeInfo])


    


    const setGameState = (scene: Scene, camera: any,result: ISceneLoaderAsyncResult) => {

                    // Load the GLB model (game board)
                 
                        const board = result.meshes[0];
                        board.position = new Vector3(0, 0, 0);
                        board.checkCollisions = true;
        
                        const scaleFactor = 1.5; // Adjust this value to scale the model
                        board.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
        
                        result.meshes.forEach((mesh) => {
                            mesh.unfreezeWorldMatrix();
                            mesh.checkCollisions = true;
                            mesh.checkCollisions = true;
                            updateBoundingInfo(mesh as Mesh);
                            //addPhysicsAggregate(mesh);
                            // Store meshes based on their names
                            if (mesh.name === "board") {
                                mesh.isPickable = false
        
                                // Create a new StandardMaterial for the board
                                const boardMaterial = new StandardMaterial("boardMaterial", scene);
                                
                                // Set the diffuse color to deep blue
                                boardMaterial.diffuseColor = new Color3(0.2, 0, 0.4); // Very deep purple color
                                
        
                                // Apply the material to the board mesh
                                mesh.material = boardMaterial;
                                                            // If the above doesn't work, try coloring vertices directly
        
        
                                gameMeshesRef.current.board = mesh;
        
                                
                            } else if (mesh.name.match(/^House\d+$/)) {
                                // Create a new StandardMaterial for the board
                                const boardMaterial = new StandardMaterial("boardMaterial", scene);
                                // Set the diffuse color to deep blue
                                boardMaterial.diffuseColor = new Color3(0.2, 0, 0.4); // Very deep purple color
                                
                                // Apply the material to the board mesh
                                mesh.material = boardMaterial;
                                                            // If the above doesn't work, try coloring vertices directly
                                mesh.physicsImpostor = new PhysicsImpostor(mesh, PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0.1 }, scene);
        
                                const isMeshAlreadyAdded = gameMeshesRef.current.houses.some(
                                  existingMesh => existingMesh.uniqueId === mesh.uniqueId
                              );
                          
                              if (!isMeshAlreadyAdded) {
                                  gameMeshesRef.current.houses.push(mesh);
                              }
                                
                            } else if (mesh.name.match(/^House\d+D$/)) {
                                
                                mesh.isPickable = false
                                const isDisplayMeshAlreadyAdded = gameMeshesRef.current.houseDisplays.some(
                                  existingMesh => existingMesh.uniqueId === mesh.uniqueId
                              );
                          
                              if (!isDisplayMeshAlreadyAdded) {
                                  gameMeshesRef.current.houseDisplays.push(mesh);
                              }
                            } else if (mesh.name === "player1" || mesh.name === "player2") {
                                mesh.isPickable = false
                                gameMeshesRef.current.playerNames[mesh.name] = mesh;
        
                                const isPlayerScreenOwner1 = address && formattedAddressCheck(challengeInfo.player_one_captured.address, address);

                                function getPlayerName(isPlayer1: boolean | undefined) {
                                    return isPlayer1 ? challengeInfo.player_one_captured.name : challengeInfo.player_two_captured.name;
                                }
                                
                                function updatePlayerNameDisplay(mesh: AbstractMesh, isClosestToScreen: boolean) {
                                    const screenOwnerName = getPlayerName(isPlayerScreenOwner1);
                                    const opponentName = getPlayerName(!isPlayerScreenOwner1);
                                    const nameToDisplay = isClosestToScreen ? screenOwnerName : opponentName;
                                    updateNameDisplay(mesh, nameToDisplay);
                                }
                                
                                if (mesh.name === "player1" || mesh.name === "player2") {
                                    updatePlayerNameDisplay(mesh, mesh.name === "player2");
                                } else {
                                    console.warn(`Unexpected mesh name: ${mesh.name}`);
                                }
        
        
                            } else if (mesh.name === "display1" || mesh.name === "display2") {
                                mesh.isPickable = false
                                gameMeshesRef.current.playerTurnDisplays[mesh.name] = mesh;
                            } else if (mesh.name === "captured1" || mesh.name === "captured2") {
                                // Create a new StandardMaterial for the board
                                const boardMaterial = new StandardMaterial("boardMaterial", scene);
        
                                // Set the diffuse color to deep blue
                                boardMaterial.diffuseColor = new Color3(0.2, 0, 0.4); // Very deep purple color
                                
                                // Apply the material to the board mesh
                                mesh.material = boardMaterial;
                                                            // If the above doesn't work, try coloring vertices directly
                                mesh.isPickable = false
                                const isPlayerScreenOwner1 = address && formattedAddressCheck(challengeInfo.player_one_captured.address, address);

                                function getPlayerCaptured(isPlayer1: boolean | undefined) {
                                    return isPlayer1 ? challengeInfo.player_one_captured.captured : challengeInfo.player_two_captured.captured;
                                }
        
                                function updatePlayerCapturedDisplay(mesh: AbstractMesh, isClosestToScreen: boolean) {
                                    const screenOwnerCaptured = getPlayerCaptured(isPlayerScreenOwner1);
                                    const opponentCaptured = getPlayerCaptured(!isPlayerScreenOwner1);
                                    const capturedToDisplay = isClosestToScreen ? screenOwnerCaptured : opponentCaptured;

                                    if (capturedToDisplay > 0){
                                        for (let i = 0; i < capturedToDisplay; i++) {
                                            addSphereInsideMesh(mesh,`seedNamec${sphere_count}`,sphere_count,true,false);
                                            sphere_count += 1
                                         }
                                        
                                    }
                                }
                                
                                if (mesh.name === "captured1" || mesh.name === "captured2") {
                                    updatePlayerCapturedDisplay(mesh, mesh.name === "captured2");
                                } else {
                                    console.warn(`Unexpected mesh name: ${mesh.name}`);
                                }
                        
        
        
                                gameMeshesRef.current.capturedHouses[mesh.name] = mesh;
        
                            } else if (mesh.name === "Home1" || mesh.name === "Home2") {
                                mesh.isPickable = false

                                const isPlayerScreenOwner1 = address && formattedAddressCheck(challengeInfo.player_one_captured.address, address);

                                function getPlayerData(isPlayer1: boolean | undefined) {
                                    return isPlayer1 ? challengeInfo.player_one_captured : challengeInfo.player_two_captured;
                                }
                                
                                function updateHomeDisplay(mesh: AbstractMesh, isOwnHome: boolean) {
                                    const playerData = getPlayerData(isPlayerScreenOwner1);
                                    const opponentData = getPlayerData(!isPlayerScreenOwner1);
                                    const dataToDisplay = isOwnHome ? playerData : opponentData;
                                    updateHouseCapturedDisplay(mesh, dataToDisplay.captured.toString());
                                }
                                
                                if (mesh.name === "Home1" || mesh.name === "Home2") {
                                    updateHomeDisplay(mesh, mesh.name === "Home2");
                                } else {
                                    console.warn(`Unexpected mesh name: ${mesh.name}`);
                                }
        
                                gameMeshesRef.current.capturedDisplays[mesh.name.toLowerCase() as keyof typeof gameMeshesRef.current.capturedDisplays] = mesh;
        
        
                            } else {
                                // Store any other meshes with their names as keys
                                gameMeshesRef.current[mesh.name] = mesh;
                            }
                        });
        
                        // Sort houses and houseDisplays arrays by their number
                        gameMeshesRef.current.houses.sort((a, b) => {
                            const numA = parseInt(a.name.replace('House', ''));
                            const numB = parseInt(b.name.replace('House', ''));
                            return numA - numB;
                        });
                        gameMeshesRef.current.houseDisplays.sort((a, b) => {
                            const numA = parseInt(a.name.replace('House', '').replace('D', ''));
                            const numB = parseInt(b.name.replace('House', '').replace('D', ''));
                            return numA - numB;
                        });
        
                        // Create seeds and update displays
                        createSeedsAndUpdateDisplays(challengeInfo.state);
        
                        // Set up house picking
                        setupHousePicking();
        
                        updatePlayerTurnDisplays(gameMeshesRef.current.playerTurnDisplays)
        
        
        
                        // Create an invisible sphere around the board to prevent camera from going through
                        const boundingSphere = MeshBuilder.CreateSphere("boundingSphere", {diameter: 30}, scene);
                        const invisibleMaterial = new StandardMaterial("invisibleMaterial", scene);
                        invisibleMaterial.alpha = 0;
                        boundingSphere.material = invisibleMaterial;
                        boundingSphere.isPickable = false;
                        boundingSphere.checkCollisions = true;
        
                        // Use the bounding sphere to limit camera movement
                        camera.setTarget(boundingSphere);
                    
                    // Create GUI
                    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
                    gameInfoDisplayRef.current = new GameInfoDisplay(advancedTexture);
        
                    // Game Info
                    const gameInfoPanel = new StackPanel();
                    gameInfoPanel.width = "100%";
                    gameInfoPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                    gameInfoPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
                    advancedTexture.addControl(gameInfoPanel);
        
                    gameInfoPanelRef.current = gameInfoPanel;
        
                    async function updateLogsFromFetch() {
                        const notices = await fetchAndProcessNotices();
                        if (gameInfoPanelRef.current) {
                          prepareLogs(notices, gameInfoPanelRef.current);
                        }
                      }
        
                    updateLogsFromFetch()

    }

    
  const cleanupGameState = () => {
    // Dispose of all meshes
    Object.values(gameMeshesRef.current).forEach(mesh => {
      if (Array.isArray(mesh)) {
        mesh.forEach((m) => m?.dispose());
      } else if (mesh instanceof Mesh) {
        mesh.dispose();
      }
    });

    // Reset gameMeshesRef
    gameMeshesRef.current = {
      board: null,
      houses: [],
      houseDisplays: [],
      playerNames: { player1: null, player2: null },
      playerTurnDisplays: { display1: null, display2: null },
      capturedHouses: { captured1: null, captured2: null },
      capturedDisplays: { home1: null, home2: null },
    };

    // Dispose of highlighted house material
    if (originalMaterialRef.current) {
      originalMaterialRef.current.dispose();
      originalMaterialRef.current = null;
    }

    // Clear game info panel
    if (gameInfoPanelRef.current) {
      gameInfoPanelRef.current.dispose();
      gameInfoPanelRef.current = null;
    }

    highlightedHouseRef.current = null;
  };


    const updateBoundingInfo = (mesh: Mesh) => {
        if (mesh.geometry) {
            const vertexData = VertexData.ExtractFromMesh(mesh);
            const positions = vertexData.positions;
            if (positions) {
                let minX = Infinity, minY = Infinity, minZ = Infinity;
                let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

                for (let i = 0; i < positions.length; i += 3) {
                    minX = Math.min(minX, positions[i]);
                    minY = Math.min(minY, positions[i + 1]);
                    minZ = Math.min(minZ, positions[i + 2]);
                    maxX = Math.max(maxX, positions[i]);
                    maxY = Math.max(maxY, positions[i + 1]);
                    maxZ = Math.max(maxZ, positions[i + 2]);
                }

                const min = new Vector3(minX, minY, minZ);
                const max = new Vector3(maxX, maxY, maxZ);
                const boundingInfo = new BoundingInfo(min, max);
                mesh.setBoundingInfo(boundingInfo);
            }
        }
        mesh.computeWorldMatrix(true);
    };
    
    const disposeSeedMeshes = () => {
      if (sceneRef.current) {
          const meshesToDispose = sceneRef.current.meshes.filter(mesh => 
              mesh.name.toLowerCase().includes('seedname') 
          );
          
          meshesToDispose.forEach(mesh => {
              mesh.dispose();
          });

          console.log(`Disposed ${meshesToDispose.length} meshes containing "seedName"`);
      }
  };

    const createSeedsAndUpdateDisplays = (state: number[]) => {
        if (!sceneRef.current || !gameMeshesRef.current.houses || !gameMeshesRef.current.houseDisplays) return;

        console.log(sceneRef.current.meshes)
        disposeSeedMeshes()
        console.log(sceneRef.current.meshes)
      

        const playerOne = challengeInfo.player_one_captured.address 

        const isPlayerScreemOwner1 = address && formattedAddressCheck(challengeInfo.player_one_captured.address, address);
        const isPlayerScreemOwner2 = address && formattedAddressCheck(challengeInfo.player_two_captured.address, address);



        let new_seed_state;

        if(isPlayerScreemOwner1){
           
            let statePartOne = state.slice(0, 6);
            let statePartTwo = state.slice(6,12);

            new_seed_state = [...statePartTwo.reverse(), ...statePartOne.reverse()]

        }
        else if(isPlayerScreemOwner2){
            let statePartOne = state.slice(0, 6);
            let statePartTwo = state.slice(6,12);

            new_seed_state = [...statePartOne.reverse(), ...statePartTwo.reverse()]

        }

        else{
            let statePartOne = state.slice(0, 6);
            let statePartTwo = state.slice(6,12);

            new_seed_state = [...statePartOne.reverse(), ...statePartTwo.reverse()]
        }

        console.log(gameMeshesRef.current)
        console.log(state)
        console.log(new_seed_state)

    
        new_seed_state.forEach((seedCount, index) => {

            const house = gameMeshesRef.current.houses[index];
            const houseDisplay = gameMeshesRef.current.houseDisplays[index];

            console.log(house)
            console.log(houseDisplay)
            
    
            // if (!house.getBoundingInfo) {
            //     console.error(`House ${index + 1} does not have bounding info.`);
            //     return;
            // }
    
            // const boundingInfo = house.getBoundingInfo();
            // const worldMatrix = house.getWorldMatrix();
            // const min = Vector3.TransformCoordinates(boundingInfo.minimum, worldMatrix);
            // const max = Vector3.TransformCoordinates(boundingInfo.maximum, worldMatrix);
    
            // console.log(`House ${index + 1} bounds:`, min, max);
    
            // // Calculate house dimensions and center
            // const houseWidth = max.x - min.x+0.02;
            // const houseDepth = max.z - min.z+0.02;
            // const houseHeight = max.y - min.y + 0.001;
            // const houseCenter = new Vector3(
            //     (min.x + max.x) / 2,
            //     (min.y + max.y) / 2,
            //     (min.z + max.z) / 2
            // );
    
            // // Define seed size (4 times larger than before)
            // const seedDiameter = Math.min(houseWidth, houseDepth, houseHeight) * 0.2; // 32% of smallest dimension (8% * 4)
            // const seedRadius = seedDiameter / 2;
    
            // // Function to generate a random position with bias towards the center
            // const generateRandomPosition = (): Vector3 => {
            //     const randomAngle = Math.random() * Math.PI * 2;
            //     const maxDistance = Math.min(houseWidth, houseDepth, houseHeight) / 2 - seedRadius;
                
            //     // Use square root for center bias (adjusted for larger seeds)
            //     const distance = Math.sqrt(Math.random()) * maxDistance;
                
            //     const offsetX = Math.cos(randomAngle) * distance;
            //     const offsetZ = Math.sin(randomAngle) * distance;
                
            //     // Y-axis uses a different distribution to account for gravity
            //     const offsetY = Math.random() * (houseHeight - seedDiameter);
    
            //     return new Vector3(
            //         houseCenter.x + offsetX,
            //         min.y + seedRadius + offsetY,
            //         houseCenter.z + offsetZ
            //     );
            // };
    
            // // Function to check if a position is not colliding with existing seeds
            // const isNotColliding = (position: Vector3, existingPositions: Vector3[]): boolean => {
            //     return !existingPositions.some(existing => 
            //         Vector3.Distance(position, existing) < seedDiameter * 1.1 // Increased buffer to 10% for larger seeds
            //     );
            // };
    
            // const seedPositions: Vector3[] = [];
    
            // Create seeds
            for (let i = 0; i < seedCount; i++) {
                addSphereInsideMesh(house,`seedName${sphere_count}`,sphere_count);
                sphere_count += 1 
                // let validPosition: Vector3 | null = null;
                // let attempts = 0;
                // const maxAttempts = 100; // Reduced attempts due to larger seed size
    
                // while (!validPosition && attempts < maxAttempts) {
                //     const candidatePosition = generateRandomPosition();
    
                //     if (isNotColliding(candidatePosition, seedPositions)) {
                //         validPosition = candidatePosition;
                //     }
    
                //     attempts++;
                // }
    
                // if (validPosition) {
                //     seedPositions.push(validPosition);
    
                //     const seed = MeshBuilder.CreateSphere(`seed-${index}-${i}`, { diameter: seedDiameter }, sceneRef.current);
       
                    
                //     const sphereMaterial = new StandardMaterial(`seed-${index}-${i}`, sceneRef.current);
                //     sphereMaterial.diffuseTexture = new Texture(sphereTexture, sceneRef.current);
                //     seed.material = sphereMaterial;
                    
                //     seed.position = validPosition;

                //     seed.physicsImpostor = new PhysicsImpostor(seed, PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0.1 }, sceneRef.current);
    
                //     // Add physics impostor to the seed
                //    // addPhysicsAggregate(seed)
                // } else {
                //     console.warn(`Couldn't place seed ${i + 1} in house ${index + 1} after ${maxAttempts} attempts.`);
                // }
            }
    
            // Update house display
            updateHouseDisplay(houseDisplay, seedCount);
        });
    
        // Allow seeds to settle
        setTimeout(() => {
            if(sceneRef.current){
                sceneRef.current.physicsEnabled = false;
            }
        }, 3000); // Maintained settling time
    };
    const updateHouseDisplay = (displayMesh: AbstractMesh, seedCount: number) => {
        const texture = new DynamicTexture(`t-${displayMesh.name}`, {width:512, height:256}, sceneRef.current);
        const material = new StandardMaterial("clockMaterial", sceneRef.current);
        material.diffuseTexture = texture;
        displayMesh.material = material;
        
    
        const ctx = texture.getContext();
        ctx.clearRect(0, 0, 512, 256);
    
        const seedsNumberString = seedCount.toString();
        
        // Set font before measuring text
        ctx.font = "bold 200px Arial";
        
        // Measure text width
        const textMetrics = ctx.measureText(seedsNumberString);
        const textWidth = textMetrics.width;
        
        // Calculate positions to center the text
        const xPosition = (512 - textWidth) / 2;
        const yPosition = 256 / 2 + 200 / 3; // Approximate vertical centering
        
    
    
        // Draw text
        texture.drawText(seedsNumberString, xPosition, yPosition, "bold 220px Arial", "blue", "transparent");
        texture.update();
    };

    const updatePlayerTurnDisplays = (playerTurnDisplays: any ) => {

        if (!sceneRef.current) return;
        
        const display1 = playerTurnDisplays.display1
        const display2 = playerTurnDisplays.display2

                // Create Babylon.js materials
        const redMaterial = new StandardMaterial("redMaterial", sceneRef.current);
        redMaterial.diffuseColor = new Color3(1, 0, 0); // Red

        const greenMaterial = new StandardMaterial("greenMaterial", sceneRef.current);
        greenMaterial.diffuseColor = new Color3(0, 1, 0); // Green


        const isScreenOwner = address && formattedAddressCheck(challengeInfo.player_turn.address, address);

        if(isScreenOwner ){
            console.log("ex")
            display2.material = greenMaterial;
            display1.material = redMaterial;
        }
        else{
            display2.material = redMaterial;
            display1.material = greenMaterial;
        }

    }

    const updateNameDisplay = (displayMesh: AbstractMesh, name: string) => {
        const texture = new DynamicTexture(`t-${displayMesh.name}`, {width:512, height:256}, sceneRef.current);
        const material = new StandardMaterial("clockMaterial", sceneRef.current);
        material.diffuseTexture = texture;
        displayMesh.material = material;
    
        
    
        const ctx = texture.getContext();
        ctx.clearRect(0, 0, 512, 256);
    
        // Set font
        const fontSize = 80;
        ctx.font = `bold ${fontSize}px Arial`;

      //  ctx.setTransform(-1, 0, 1, 1, 0, -128);
        
        // Calculate vertical position (center vertically)
        const yPosition = 256 / 2 + fontSize / 3; // Approximate vertical centering
    
        // Set a small left margin
        const xPosition = 10; // 10 pixels from the left edge

       // texture.uScale = 2;

        // Draw text
        texture.drawText(name, xPosition, yPosition, `bold ${fontSize}px Arial`, "green", "transparent");
        texture.update();
    }

    const updateHouseCapturedDisplay = (displayMesh: AbstractMesh, captured: string) => {
        const texture = new DynamicTexture(`t-${displayMesh.name}`, {width:512, height:256}, sceneRef.current);
        const material = new StandardMaterial("clockMaterial1", sceneRef.current);
        material.diffuseTexture = texture;
        displayMesh.material = material;
        
    
        const ctx = texture.getContext();
        ctx.clearRect(0, 0, 512, 256);
    
        const seedsNumberString = captured;
        
        // Set font before measuring text
        ctx.font = "bold 200px Arial";
        
        // Measure text width
        const textMetrics = ctx.measureText(seedsNumberString);
        const textWidth = textMetrics.width;
        
        // Calculate positions to center the text
        const xPosition = (512 - textWidth) / 2;
        const yPosition = 256 / 2 + 200 / 3; // Approximate vertical centering
        
    
    
        // Draw text
        texture.drawText(seedsNumberString, xPosition, yPosition, "bold 220px Arial", "green", "transparent");
        texture.update()
    }

    const toInvert = (): boolean => {
        if (!address) return false
        return formattedAddressCheck(challengeInfo.creator[1], address)
    } 

    function addSphereInsideMesh(mesh: AbstractMesh,seedName: string,sphere_count:number, capture:boolean = false, isDefault:boolean=false) {
        // Create a new sphere with MeshBuilder
        const newSphere = MeshBuilder.CreateSphere(seedName, { diameter: 0.05 }, sceneRef.current); // Adjust the diameter as needed

        //newSphere.physicsImpostor = new PhysicsImpostor(newSphere, PhysicsImpostor.SphereImpostor, { mass: 0.02 }, sceneRef.current);

        let sphereADefault: boolean = false;
        // Compute the center of the clicked mesh's bounding box in world space
        const boundingBoxCenter =  () : Vector3 => {

          if (isDefault){
            if(gameMeshesRef.current.board){
              const offset = gameMeshesRef.current.board.position.clone();
              const boundingBoxCenter = mesh.getBoundingInfo().boundingBox.centerWorld;
              const resultantVector = boundingBoxCenter.add(offset);
              sphereADefault = true;
              return resultantVector
            }else {
              sphereADefault = true;
              return mesh.getBoundingInfo().boundingBox.centerWorld;
            }
          }else{
            return mesh.getBoundingInfo().boundingBox.centerWorld;
          }   
        } 

        newSphere.position.copyFrom(boundingBoxCenter());
        newSphere.isPickable = false;
        // applyRandomDeformities(newSphere, 6);

        //console.log(boundingBoxCenter);

        const sphereMaterial = new StandardMaterial(`seed-${sphere_count}`, sceneRef.current);
        sphereMaterial.diffuseTexture = new Texture('/nuttexture3.avif', sceneRef.current);
        newSphere.material = sphereMaterial;

        // Check for collisions with previously added spheres
        if (checkSphereCollisions(newSphere, (mesh.name === "captured1" || mesh.name === "captured2") ? true : false)) {
          // If collision detected, calculate a new position
          const newPosition = calculateNewSpherePosition(mesh,sphereADefault);
          newSphere.position.copyFrom(newPosition);
          newSphere.isPickable = false;
        } 

        if (!capture){
             addedSpheres.push(newSphere);
     
           } else{
            capturedSpheres.push(newSphere);
            
           }
   
      }

    // Function to check for collisions with existing spheres
    function checkSphereCollisions(newSphere: Mesh,capture: boolean = false): boolean {
        const meshToCheck = !capture ? addedSpheres : capturedSpheres;
        for (const existingSphere of meshToCheck) {
            // Calculate the distance between the centers of the spheres
            const distance = Vector3.Distance(existingSphere.position, newSphere.position);

            // Check if the spheres overlap (distance less than sum of their radii)
            if (distance < (existingSphere.scaling.x + newSphere.scaling.x) / 2) {
            return true; // Collision detected
            }
        }

        return false; // No collision detected
        }

              
        function calculateNewSpherePosition(mesh: AbstractMesh, isDefaultSphere = false): Vector3 {
            const getBoundingBoxCenter = (): Vector3 => {
                if (isDefaultSphere && gameMeshesRef.current.board) {
                    const offset = gameMeshesRef.current.board.position.clone();
                    const boundingBoxCenter = mesh.getBoundingInfo().boundingBox.centerWorld;
                    return boundingBoxCenter.add(offset);
                } else {
                    return mesh.getBoundingInfo().boundingBox.centerWorld;
                }
            };
        
            const boundingBoxCenter = getBoundingBoxCenter();
            let radius = mesh.getBoundingInfo().boundingBox.extendSize.length() / 2;

            if (mesh.name === "captured1" || mesh.name === "captured2") {
              radius = mesh.getBoundingInfo().boundingBox.extendSize.length() / 4;
            }
        
            // Generate random spherical coordinates
            const theta = Math.random() * Math.PI; // Azimuthal angle (0 to π)
            const phi = Math.random() * Math.PI; // Polar angle (0 to π)
        
            // Convert spherical coordinates to Cartesian
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(theta);
            
        
            // Ensure the point is in the upper hemisphere
            const newPosition = new Vector3(
                boundingBoxCenter.x + x,
                boundingBoxCenter.y + Math.abs(y), // Use absolute value to keep it in upper hemisphere
                boundingBoxCenter.z + z
            );
        
            if (mesh.name === 'capture-house') {
                console.log("New position sphere", newPosition);
            }
        
            return newPosition;
        }
        

    const setupHousePicking = () => {
        if (!sceneRef.current) return;

        const isScreenOwner = address && formattedAddressCheck(challengeInfo.player_turn.address, address);


        gameMeshesRef.current.houses.forEach((house, index) => {
            house.actionManager = new ActionManager(sceneRef.current);
            house.actionManager.registerAction(
                new ExecuteCodeAction(
                    ActionManager.OnPickTrigger,
                    () => {

                        if (isScreenOwner && (index > 5 && index < 12)){
                            highlightHouse(index);
                            console.log(`House ${index + 1} picked`);
                            // Here you can send the house number to your backend

                            const playerHouses: string[] = challengeInfo.player_turn.houses

                            // console.log(playerHouses)

                            const exists = playerHouses.includes(`House${index+1}`);

                            const actualHouse =  mapHouseIndex(index,exists,playerHouses) + 1;


                            const houseSeeds = challengeInfo.state[actualHouse -1]

                            if (houseSeeds <= 0){

                                const toastId = uuidv4();
                    
                                toast({
                                    id: toastId,
                                    title: "House empty",
                                    description: "Please select a house with seeds.",
                                    status: "warning",
                                    duration: 5000,
                                    isClosable: true,
                                });

                                return

                            }

                            makeMove(`House${actualHouse}`)
                            .then(() => {
                                console.log("Move made successfully");
                            })
                            .catch((error) => {
                                console.error("Error making move:", error);
                            });


                        }
                    }
                )
            );
        });
    };

    const highlightHouse = (houseIndex: number) => {
        if (!sceneRef.current) return;

        // Unhighlight the previously highlighted house
        if (highlightedHouseRef.current !== null) {
            const prevHouse = gameMeshesRef.current.houses[highlightedHouseRef.current];
            if (prevHouse instanceof Mesh && originalMaterialRef.current) {
                prevHouse.material = originalMaterialRef.current;
            }
        }

        // Highlight the newly picked house
        const house = gameMeshesRef.current.houses[houseIndex];
        if (house instanceof Mesh) {
            // Store the original material
            originalMaterialRef.current = house.material as StandardMaterial;

            // Create a new material for highlighting
            const highlightMaterial = new StandardMaterial(`highlightMaterial-${houseIndex}`, sceneRef.current);
            highlightMaterial.diffuseColor = new Color3(1, 1, 0); // Yellow highlight
            highlightMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
            highlightMaterial.emissiveColor = new Color3(0.2, 0.2, 0); // Slight glow

            // Assign the new material to the house
            house.material = highlightMaterial;

            highlightedHouseRef.current = houseIndex;
        }
    };

    useEffect(() => {
        if (challenge && !selectedTournamentId) {

          setChallengeInfo(challenge);
        }

        if (tourn && tourn.tournament && selectedTournamentId) {

          setChallengeInfo(tourn.tournament.challenges[parseInt(initialChallengeInfo.challenge_id)]);
        }


      }, [challenge,tourn?.tournament]);

    function addPhysicsAggregate(meshe: TransformNode) {
        const res = new PhysicsAggregate(
            meshe,
            PhysicsShapeType.BOX,
            { mass: 0, friction: 0.5 },
            sceneRef.current
        );
        // this.physicsViewer.showBody(res.body);
        return res;
    }

    const makeMove = async (selectedHouse: string) => {

      

        const dataToSend = !selectedTournamentId ? {
            method: "make_move",
            challenge_id: parseInt(challengeInfo.challenge_id),
             house: selectedHouse
          }:{
            method: "make_move_tournament",
            tournament_id: parseInt(selectedTournamentId),
            challenge_id: parseInt(challengeInfo.challenge_id),
            house: selectedHouse
          };

          const toastId = uuidv4();
  
          toast({
            id: toastId,
            title: "making move",
            description: "Please wait...",
            status: "info",
            duration: null,
            isClosable: true,
          });

          try {
            const result = await sendInput(JSON.stringify(dataToSend), writeContractAsync);
            if (result.success) {
    
              toast.update(toastId, {
                title: "move made",
                description: "move successfully made.",
                status: "success",
                duration: 5000,
                isClosable: true,
              });

              async function updateLogsFromFetch() {
                const notices = await fetchAndProcessNotices();
                if (gameInfoPanelRef.current) {
                  prepareLogs(notices, gameInfoPanelRef.current);
                }
              }

              await updateLogsFromFetch();

              await new Promise(resolve => setTimeout(resolve, 5000));

              await refetch();

    
              startPolling();
              // Additional success handling (e.g., reset form, close modal, etc.)
            } else {
              throw new Error("Failed to make move");
            }
          } catch (error) {
            console.error("Error making move:", error);
            toast.update(toastId, {
              title: "Error",
              description: "Failed to make move. Please try again.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            // Additional error handling if needed
          }
    }

    function mapHouseIndex(index: number,exists: boolean,houses:string[]) {
        if (exists) {
            const indexofhouse = houses.indexOf(`House${index+1}`)
            //console.log(indexofhouse)
            return 11 - indexofhouse;
        } else {
            return 11 - index;
        }
    }

    function prepareLogs(logs: any[],gameInfoPanel: StackPanel,maxLogs: number = 5){
        gameInfoPanel.clearControls();

        const logText = new TextBlock();
        logText.color = "orange";
        logText.fontSize = 14;
        logText.height = "30px";
        logText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        logText.left = "10px";
        logText.text = ""; // Start empty

        gameInfoPanel.addControl(logText);

        let currentIndex = 0;

    function displayNextLog() {
        if (currentIndex < logs.length) {
            const logData = hexToString(logs[currentIndex].node.payload);
            logText.text = `📝 ${logData}`;
            currentIndex++;
            setTimeout(displayNextLog, 5000); // Display each log for 2 seconds
        } else {
            logText.text = ""; // Clear the log when all messages are displayed
        }
    }

    displayNextLog();
    }

    async function fetchAndProcessNotices(maxEntries: number = 5): Promise<any[]> {
        try {
          // Fetch the data
          const response_data: any =  await fetchGraphQLData(NOTICES_QUERY);
      
          // Process the data
          function getLastNOrAll<T>(arr: T[], n: number): T[] {
            return arr.slice(-n);
          }
      
          // Get the last 'maxEntries' number of notices
          const processedNotices = getLastNOrAll(response_data.notices.edges, maxEntries);
      
          return processedNotices;
        } catch (error) {
          console.error('Error fetching and processing notices:', error);
          return [];
        }
      }

      // clean up needed
      const startPolling = (intervalMs = 15000) => {
        let intervalId: NodeJS.Timeout | null = null;
        const currentPlayerAddress = address;
      
        const pollForMove = () => {
          // Check if it's the current player's turn
          if (challengeInfo.player_turn.address === currentPlayerAddress) {
            console.log("It's your turn. Stopping polling.");
            if (intervalId !== null) {
              clearInterval(intervalId);
              intervalId = null;
              setIsPolling(false);
            }
            if (!selectedTournamentId){
              inspect(JSON.stringify({
                method: "get_challenge",
                challenge_id: parseInt(challengeInfo.challenge_id)
              }))
                .then(result => {
                  try {
                    const challengeResults = JSON.parse(hexToString(result[0].payload))["challenge"];
                    console.log("results: ", challengeResults);
                    return challengeResults;
                  } catch (e) {
                    console.error("Error parsing results: ", e);
                    throw e;
                  }
                })
                .then(challengeResults => {
    
                  const player  = (currentPlayerAddress &&  (challengeResults[0].player_turn.address).toLowerCase() !== currentPlayerAddress.toLowerCase())
                  if (player) {
                    return refetch().then(() => {
                      console.log("Game state updated after move detected");
                      if (challengeInfo.current_round < challengeResults[0].current_round){
                        updateRoundWinner(challengeResults[0], currentPlayerAddress)
                      }else{
                        updateWinner(challengeResults[0],currentPlayerAddress);
                      }
                    });
                  }
                })
                .catch(error => {
                  console.error("Error in pollForMove: ", error);
                });
              return;
            }else{
              inspect(JSON.stringify({
                method: "get_tournament",
                tournament_id: parseInt(selectedTournamentId)
              }))
                .then(result => {
                  try {
                    const tournamentResults = JSON.parse(hexToString(result[0].payload))["tournament"];
                    console.log("results: ", tournamentResults);
                    return tournamentResults;
                  } catch (e) {
                    console.error("Error parsing results: ", e);
                    throw e;
                  }
                })
                .then(tournamentResults => {
    
                  const player  = (currentPlayerAddress &&  (tournamentResults[0].challenges[parseInt(challengeInfo.challenge_id)].player_turn.address).toLowerCase() !== currentPlayerAddress.toLowerCase())
                  if (player) {
                    return refetch().then(() => {
                      console.log("Game state updated after move detected");
                      if (challengeInfo.current_round < tournamentResults[0].challenges[parseInt(challengeInfo.challenge_id)].current_round){
                        updateRoundWinner(tournamentResults[0].challenges[parseInt(challengeInfo.challenge_id)], currentPlayerAddress)
                      }else{
                        updateWinner(tournamentResults[0].challenges[parseInt(challengeInfo.challenge_id)],currentPlayerAddress);
                      }
                    });
                  }
                })
                .catch(error => {
                  console.error("Error in pollForMove: ", error);
                });
              return;
            }

          }


          if(!selectedTournamentId){

          inspect(JSON.stringify({
            method: "get_challenge",
            challenge_id: parseInt(challengeInfo.challenge_id)
          }))
            .then(result => {
              try {
                const challengeResults = JSON.parse(hexToString(result[0].payload))["challenge"];
                console.log("results: ", challengeResults);
                return challengeResults;
              } catch (e) {
                console.error("Error parsing results: ", e);
                throw e;
              }
            })
            .then(challengeResults => {

              const player  = (currentPlayerAddress &&  (challengeResults[0].player_turn.address).toLowerCase() === currentPlayerAddress.toLowerCase())
              if (player) {
                console.log("It's now your turn!");
                setIsPolling(false);
                if (intervalId !== null) {
                  clearInterval(intervalId);
                  intervalId = null;
                }
                return refetch().then(() => {
                  console.log("Game state updated after move detected");
                  if (challengeInfo.current_round < challengeResults[0].current_round){
                    updateRoundWinner(challengeResults[0], currentPlayerAddress)
                  }else{
                    updateWinner(challengeResults[0],currentPlayerAddress);
                  }
                  
                });
              }
            })
            .catch(error => {
              console.error("Error in pollForMove: ", error);
            });

          }else if(selectedTournamentId && tourn){
            inspect(JSON.stringify({
              method: "get_tournament",
              tournament_id: parseInt(selectedTournamentId)
            }))
              .then(result => {
                try {
                  const tournamentResults = JSON.parse(hexToString(result[0].payload))["tournament"];
                  console.log("results: ", tournamentResults);
                  return tournamentResults;
                } catch (e) {
                  console.error("Error parsing results: ", e);
                  throw e;
                }
              })
              .then(tournamentResults => {
  
                const player  = (currentPlayerAddress &&  (tournamentResults[0].challenges[parseInt(challengeInfo.challenge_id)].player_turn.address).toLowerCase() === currentPlayerAddress.toLowerCase())
                if (player) {
                  console.log("It's now your turn!");
                  setIsPolling(false);
                  if (intervalId !== null) {
                    clearInterval(intervalId);
                    intervalId = null;
                  }
                  return tourn.fetchTournament().then(() => {
                    console.log("Game state updated after move detected");
                    if (challengeInfo.current_round < tournamentResults[0].challenges[parseInt(challengeInfo.challenge_id)].current_round){
                      updateRoundWinner(tournamentResults[0].challenges[parseInt(challengeInfo.challenge_id)], currentPlayerAddress)
                    }else{
                      updateWinner(tournamentResults[0].challenges[parseInt(challengeInfo.challenge_id)],currentPlayerAddress);
                    }
                    
                  });
                }
              })
              .catch(error => {
                console.error("Error in pollForMove: ", error);
              });
          }
        };
      
        // Function to start polling
        const startPollingIfNeeded = () => {
          if (challengeInfo.player_turn && challengeInfo.player_turn.address !== currentPlayerAddress && !intervalId) {
            console.log("Starting to poll for opponent's move");
            setIsPolling(true);
            intervalId = setInterval(pollForMove, intervalMs);
          }
        };
      
        // Initial check and start polling if needed
        startPollingIfNeeded();
      
        // Return an object with functions to manually control polling
        return {
          stop: () => {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          },
          start: startPollingIfNeeded
        };
      };

      const updateWinner = (challengeResults: Challenge, currentPlayerAddress: string) => {
        if (sceneRef.current && advancedTextureRef.current && statusTextRef.current) {
          if (challengeResults.winner) {
            const isCurrentPlayerWinner = challengeResults.winner.address.toLowerCase() === currentPlayerAddress.toLowerCase();
            
            if (isCurrentPlayerWinner) {
              createWinPanel(sceneRef.current, advancedTextureRef.current);
              statusTextRef.current.text = "🏆 Congratulations! You won! 🎉";
            } else {
              createWinPanel(sceneRef.current, advancedTextureRef.current);
              statusTextRef.current.text = "😔 Sorry, you lost. Better luck next time! 🍀";
            }
          } else if (!challengeResults.winner && challengeResults.game_ended) {
            statusTextRef.current.text =  "🤝 The challenge ended in a draw! 🔄";
          }
        }
      };

      const updateRoundWinner = (challengeResults: Challenge, currentPlayerAddress: string) => {
        if (sceneRef.current && advancedTextureRef.current && statusTextRef.current) {

          if (!challengeResults.winner  && challengeResults.round_winners[challengeInfo.current_round]) {

            const isCurrentPlayerWinner = challengeResults.round_winners[challengeInfo.current_round].address.toLocaleLowerCase() === currentPlayerAddress.toLowerCase();
            
            if (isCurrentPlayerWinner) {
              createWinPanel(sceneRef.current, advancedTextureRef.current, true);
              statusTextRef.current.text = `🏆 Congratulations! You won round ${challengeInfo.current_round}! 🎉🎉`;
            } else {
              createWinPanel(sceneRef.current, advancedTextureRef.current,true);
              statusTextRef.current.text = `😔 Sorry, you lost round ${challengeInfo.current_round}. Better luck next round! 🍀`;
            }
          } else if (!challengeResults.winner  && !challengeResults.round_winners[challengeInfo.current_round]) {
            statusTextRef.current.text = "🤝 The round ended in a draw. 🔄";
          }
        }
      };

      function createWinPanel(scene: Scene,advancedTexture : AdvancedDynamicTexture, round: boolean = false) {
        // Container
        const guiContainer = new Rectangle();
        guiContainer.alpha = 0.9;
        guiContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
        guiContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
        guiContainer.width = "400px";
        guiContainer.height = "250px";
        guiContainer.cornerRadius = 20;
        guiContainer.left = "20px";
        guiContainer.top = "-20px";
        guiContainer.color = "white";
        guiContainer.thickness = 0;
        guiContainer.background = "black";
        guiContainer.name = "guicontainer"
        guiContainer.alpha = 0.5;
        advancedTexture.addControl(guiContainer);
    
        guiContainerRef.current = guiContainer;
    
        // name panel
        const namePanel = new StackPanel();
        namePanel.verticalAlignment =
            Control.VERTICAL_ALIGNMENT_BOTTOM;
        namePanel.horizontalAlignment =
            Control.HORIZONTAL_ALIGNMENT_LEFT;
        namePanel.top = -45;
        namePanel.left = 0;
        namePanel.name = "namePanel"
        guiContainer.addControl(namePanel);
    

        const statusText = new TextBlock()
        statusText.height = "70px"
        statusText.color = "white"
        statusText.fontSize = 14 // Reduced font size
        statusText.textWrapping = true // Enable text wrapping
        statusText.resizeToFit = true // Automatically resize text to fit
        statusText.paddingTop = "5px"
        statusText.paddingBottom = "5px"
        namePanel.addControl(statusText)
       
      
        const acquireButton = Button.CreateSimpleButton("proceedButton", "Okay")
        acquireButton.width = "140px"
        acquireButton.height = "40px"
        acquireButton.color = "white"
        acquireButton.cornerRadius = 10
        acquireButton.background = "green"
        acquireButton.thickness = 0;
        acquireButton.paddingTop = 5;
        namePanel.addControl(acquireButton)
      

    
        statusTextRef.current = statusText;
      
        acquireButton.onPointerUpObservable.add(async () => {
         
            try {
              if (round) {
                // Call function one
                await refetch();
                // Remove namePanel
                advancedTexture.removeControl(guiContainer);
                guiContainerRef.current = null
            } else {
                // Remove namePanel
                advancedTexture.removeControl(guiContainer);
                guiContainerRef.current = null
                
                // Navigate to the specified page
                navigate('/challenges');
            }

            } catch (err: any) {
              console.error("Error in acquireButton click handler:", err);
            }

        })
      
 
    
      
        return namePanel
      }

      useEffect(() => {
       const {stop} = startPolling();
        return () => stop(); // Clean up when component unmounts
      }, []);

      
    return (
        <Flex direction="column" align="center" justify="center" bg="gray.900">
          <Box 
            width="90%" 
            height="600px" 
            bg="white" 
            borderRadius="lg" 
            overflow="hidden" 
            boxShadow="xl"
          >
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          </Box>
        </Flex>
    );
};

export default OwareGame;