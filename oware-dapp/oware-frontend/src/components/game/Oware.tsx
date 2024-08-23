import React, { useEffect, useRef } from 'react';
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
  CreateTextShapePaths
} from "@babylonjs/core"
import { AdvancedDynamicTexture, Control, StackPanel, TextBlock } from '@babylonjs/gui/2D';
import "@babylonjs/loaders/glTF";
import { Challenge } from '../../utils/types';
import * as CANNON from 'cannon';
import HavokPhysics from '@babylonjs/havok';
import { formattedAddressCheck } from '../../utils';

import { useAccount } from 'wagmi';

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
  
const OwareGame = ({ challengeInfo }: {challengeInfo: Challenge}) => {

    const canvasRef = useRef(null);

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
      const highlightedHouseRef = useRef<number | null>(null);
      const originalMaterialRef = useRef<StandardMaterial | null>(null);

      const { address } = useAccount();

    useEffect(() => {
        if (canvasRef.current) {
            const engine = new Engine(canvasRef.current, true);
            const scene = new Scene(engine);

      
            
            sceneRef.current = scene;

            scene.collisionsEnabled = true;

            const gravityVector = new Vector3(0, -9.81, 0);
            const physicsPlugin = new CannonJSPlugin();
            scene.enablePhysics(gravityVector, physicsPlugin);
            
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

            console.log(address)

            // if( address && formattedAddressCheck(challengeInfo.creator[1], address)){
                 
            // }else{
            //     camera.upperAlphaLimit = -Math.PI / 2;
            // }
            
            // rotate according to player

            // Disable panning
            camera.panningSensibility = 0;

            // Light
           let light =  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

           light.intensity = 0.7

        //    const check_player = toInvert()

        //    const model_name = check_player ? 'board' : 'board_one'

         
            // Load the GLB model (game board)
            SceneLoader.ImportMeshAsync("", "assets/", `board.glb`, scene).then((result) => {
                const board = result.meshes[0];
                board.position = new Vector3(0, 0, 0);
                board.checkCollisions = true;

                const scaleFactor = 1.5; // Adjust this value to scale the model
                board.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);

                result.meshes.forEach((mesh) => {
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

                        gameMeshesRef.current.houses.push(mesh);
                        
                    } else if (mesh.name.match(/^House\d+D$/)) {
                        
                        mesh.isPickable = false
                        gameMeshesRef.current.houseDisplays.push(mesh);
                    } else if (mesh.name === "player1" || mesh.name === "player2") {
                        mesh.isPickable = false
                        gameMeshesRef.current.playerNames[mesh.name] = mesh;

                        const isCreator = address && typeof address === 'string' && formattedAddressCheck(challengeInfo.creator[1], address);
                        const creatorName = challengeInfo.creator[0];
                        const opponentName = challengeInfo.opponent[0];
                    
                        if (mesh.name === "player1") {
                            updateNameDisplay(mesh, isCreator ? opponentName : creatorName);
                        } else if (mesh.name === "player2") {
                            updateNameDisplay(mesh, isCreator ? creatorName : opponentName);
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




                        gameMeshesRef.current.capturedHouses[mesh.name] = mesh;

                    } else if (mesh.name === "Home1" || mesh.name === "Home2") {
                        mesh.isPickable = false
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
            });

            // Create GUI
            const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

            // Challenge Info Panel
            const panel = new StackPanel();
            panel.width = "300px";
            panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            advancedTexture.addControl(panel);

            const addInfoText = (text: string) => {
                const textBlock = new TextBlock();
                textBlock.text = text;
                textBlock.color = "white";
                textBlock.height = "40px";
                panel.addControl(textBlock);
            };

            // Add challenge info to the panel
            addInfoText(`Challenge ID: ${challengeInfo.challenge_id}`);
            addInfoText(`Creator: ${challengeInfo.creator[0]}`);
            addInfoText(`Rounds: ${challengeInfo.rounds}`);
            addInfoText(`Type: ${challengeInfo.challenge_type}`);
            addInfoText(`Current Round: ${challengeInfo.current_round}`);

            // Player Info
            const playerInfoPanel = new StackPanel();
            playerInfoPanel.width = "300px";
            playerInfoPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
            playerInfoPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            advancedTexture.addControl(playerInfoPanel);

            addInfoText.call(playerInfoPanel, `Player 1: ${challengeInfo.creator[0] ? challengeInfo.creator[0] : 'Waiting...'}`);
            addInfoText.call(playerInfoPanel, `Player 2: ${challengeInfo.opponent[0] ? challengeInfo.opponent[0] : 'Waiting...'}`);
            addInfoText.call(playerInfoPanel, `Status: ${challengeInfo.in_progress ? "Game in Progress" : "Waiting for Players"}`);

            engine.runRenderLoop(() => {
                scene.render();
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
    }, [challengeInfo]);

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
    
    const createSeedsAndUpdateDisplays = (state: number[]) => {
        if (!sceneRef.current) return;
    
        state.forEach((seedCount, index) => {
            const house = gameMeshesRef.current.houses[index] as Mesh;
            const houseDisplay = gameMeshesRef.current.houseDisplays[index];
            
    
            if (!house.getBoundingInfo) {
                console.error(`House ${index + 1} does not have bounding info.`);
                return;
            }
    
            const boundingInfo = house.getBoundingInfo();
            const worldMatrix = house.getWorldMatrix();
            const min = Vector3.TransformCoordinates(boundingInfo.minimum, worldMatrix);
            const max = Vector3.TransformCoordinates(boundingInfo.maximum, worldMatrix);
    
            console.log(`House ${index + 1} bounds:`, min, max);
    
            // Calculate house dimensions and center
            const houseWidth = max.x - min.x+0.02;
            const houseDepth = max.z - min.z+0.02;
            const houseHeight = max.y - min.y + 0.001;
            const houseCenter = new Vector3(
                (min.x + max.x) / 2,
                (min.y + max.y) / 2,
                (min.z + max.z) / 2
            );
    
            // Define seed size (4 times larger than before)
            const seedDiameter = Math.min(houseWidth, houseDepth, houseHeight) * 0.2; // 32% of smallest dimension (8% * 4)
            const seedRadius = seedDiameter / 2;
    
            // Function to generate a random position with bias towards the center
            const generateRandomPosition = (): Vector3 => {
                const randomAngle = Math.random() * Math.PI * 2;
                const maxDistance = Math.min(houseWidth, houseDepth, houseHeight) / 2 - seedRadius;
                
                // Use square root for center bias (adjusted for larger seeds)
                const distance = Math.sqrt(Math.random()) * maxDistance;
                
                const offsetX = Math.cos(randomAngle) * distance;
                const offsetZ = Math.sin(randomAngle) * distance;
                
                // Y-axis uses a different distribution to account for gravity
                const offsetY = Math.random() * (houseHeight - seedDiameter);
    
                return new Vector3(
                    houseCenter.x + offsetX,
                    min.y + seedRadius + offsetY,
                    houseCenter.z + offsetZ
                );
            };
    
            // Function to check if a position is not colliding with existing seeds
            const isNotColliding = (position: Vector3, existingPositions: Vector3[]): boolean => {
                return !existingPositions.some(existing => 
                    Vector3.Distance(position, existing) < seedDiameter * 1.1 // Increased buffer to 10% for larger seeds
                );
            };
    
            const seedPositions: Vector3[] = [];
    
            // Create seeds
            for (let i = 0; i < seedCount; i++) {
                let validPosition: Vector3 | null = null;
                let attempts = 0;
                const maxAttempts = 100; // Reduced attempts due to larger seed size
    
                while (!validPosition && attempts < maxAttempts) {
                    const candidatePosition = generateRandomPosition();
    
                    if (isNotColliding(candidatePosition, seedPositions)) {
                        validPosition = candidatePosition;
                    }
    
                    attempts++;
                }
    
                if (validPosition) {
                    seedPositions.push(validPosition);
    
                    const seed = MeshBuilder.CreateSphere(`seed-${index}-${i}`, { diameter: seedDiameter }, sceneRef.current);
       
                    
                    const seedMaterial = new StandardMaterial(`sphereMaterial${index}`, sceneRef.current);
                    seedMaterial.diffuseColor = new Color3(1, 0.8, 0);
                    seed.material = seedMaterial;
                    
                    seed.position = validPosition;

                    seed.physicsImpostor = new PhysicsImpostor(seed, PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0.1 }, sceneRef.current);
    
                    // Add physics impostor to the seed
                   // addPhysicsAggregate(seed)
                } else {
                    console.warn(`Couldn't place seed ${i + 1} in house ${index + 1} after ${maxAttempts} attempts.`);
                }
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


        const isCreator = address && formattedAddressCheck(challengeInfo.creator[1], address);

        if(isCreator){
            display2.material = greenMaterial;
            display1.material = redMaterial;
        }else{
            display1.material = greenMaterial;
            display2.material = redMaterial;
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

    const toInvert = (): boolean => {
        if (!address) return false
        return formattedAddressCheck(challengeInfo.creator[1], address)
    } 


    const setupHousePicking = () => {
        if (!sceneRef.current) return;

        gameMeshesRef.current.houses.forEach((house, index) => {
            house.actionManager = new ActionManager(sceneRef.current);
            house.actionManager.registerAction(
                new ExecuteCodeAction(
                    ActionManager.OnPickTrigger,
                    () => {
                        highlightHouse(index);
                        console.log(`House ${index + 1} picked`);
                        // Here you can send the house number to your backend
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




    return (
        <Flex direction="column" align="center" justify="center" bg="gray.900">
          <Box 
            width="80%" 
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