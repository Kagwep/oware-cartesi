import './style.css';
import React, { useEffect, useRef,useState} from 'react';
import {
    Scene,
    Engine,
    Vector3,
    HemisphericLight,
    MeshBuilder,
    StandardMaterial,
    Texture,
    SceneLoader,
    Mesh,
    AbstractMesh,
    VertexBuffer,
    ArcRotateCamera,
    Color3,

    
  } from "@babylonjs/core";
import './style.css';
import '@babylonjs/loaders';
import {House, houses} from './House';
import { Seed, Seeds } from './Seed';
import { state,playersStates } from './GameState';
import { housesToAccess,housesCoordinates } from './House';
import sphereTexture from "../Textures/nuttexture3.avif";
import { Card, CardContent, CircularProgress, Typography, Grid ,Paper} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {Button} from '@mui/material';
import HouseIcon from '@mui/icons-material/House';
import { start } from './GameState';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';
import { JsonRpcProvider } from "@ethersproject/providers";
import { InputBox__factory } from "@cartesi/rollups";
import { Input,  useToast } from "@chakra-ui/react";
import { useQuery, gql } from "@apollo/client";
import { hexToString } from "viem"

interface ButtonProps {
  // Define the interface for buttonProps here
  isLoading: boolean;
  // Other properties if applicable
}

export interface Players {
  id:string;
  username:string;
}
export interface Identity {
  player1:string;
  player2:string;
}

export interface CanvasProps {
  players:Players[];
  room:string;
  orientation?:string;
  cleanup?:() => void;
  username:string;
  player_identity:string;
}


export interface GameStartState {
  turn:string;
  opponentHouses:string[];
}


interface Move {
  selectedHouse:House;
  seedAdd:Seeds;
  player:string;
  action:number;
  progress:boolean;

}

// uint256 winId, string memory winTrace,address opponent,string memory player_username
interface Register {
 winId:string;
 winTrace:string;
 opponent_address:string;
 player_username:string;

}


// OBS: change DApp address as appropriate
const DAPP_ADDRESS = "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C";

// Standard configuration for local development environment
const INPUTBOX_ADDRESS = "0x59b22D57D4f067708AB0c00552767405926dc768";
const HARDHAT_DEFAULT_MNEMONIC =
    "test test test test test test test test test test test junk";
const HARDHAT_LOCALHOST_RPC_URL = "http://localhost:8545";

interface OwareInputProps {
  accountIndex: number;
  // Other props if applicable
}


const Canvas:React.FC<CanvasProps> = ({ players, room,username,player_identity,cleanup }) => {

    const [over, setOver] = useState("");
    const [overBool, setOverBool] = useState<boolean>(false);
    const [overTitle, setOverTitle] = useState("");
    const [overText, setOvertText] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [playerHouses, setPlayerHouses] = useState<string[]>([]);
    const [inProgress, setInProgress] = useState<boolean>(false);
    const [playerTurn, setPlayerTurn] = useState<string>("");
   // const { provider, account, connectWallet, disconnectWallet,contract,signer } = useWallet();
    const [accountIndex] = useState(0);
    const toast = useToast();
    const [loading, setLoading] = useState(false);

 
    
    //console.log(player_identity);
    const handleCopySuccess = () => {
      setIsCopied(true);
    };


    //console.log(room);




    const isWaitingForOpponent = false;

    const createScene = async (canvas: HTMLCanvasElement | null): Promise<{ scene: Scene | undefined, defaultSpheres: () => void,playersTurn :string}> => {
       
      if (!canvas) {
        // If canvas is null, return a promise with an object where scene is undefined
        return Promise.resolve({ scene: undefined, defaultSpheres: () => {},moveSpheres: () => {},playersTurn:'' });
      }    
      
        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);
        let playing_next = player_identity;

        let trace = ""

        let move_notices: string | any[] = []

        let previous_agent_house = "";
      
        var camera = new ArcRotateCamera("camera1", 0,  0, 10, Vector3.Zero(), scene);

        camera.attachControl(canvas, true);

        camera.speed = 0.25;

        camera.setPosition(new Vector3(0.003763740788813662, 43.32877130120143, 9.1329997049811053));

        let isPlayerTurn:boolean;



        camera.lowerAlphaLimit = camera.upperAlphaLimit = camera.alpha ;

        camera.lowerBetaLimit = Math.PI / 11; // Set to the desired angle in radians
        camera.upperBetaLimit = Math.PI * 0.8; // Set to the desired angle in radians
    
        const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 2, 0), scene);


        hemiLight.intensity = 1;
      
        //const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

        // const board = SceneLoader.ImportMesh('','./models/','board.gltf',scene,(meshes) => {
        //   console.log('meshes',meshes)
        // })

        const playerIcon = document.getElementById('player-icon');
        if (playerIcon) {
          playerIcon.innerHTML =  '&#128526;';
        }

  
        
        const loadModels = async (modelName:string) => {
          try {
            const result = await SceneLoader.ImportMeshAsync('', './models/', modelName);
            // Do something with the result here
            return result; // You can return the result if needed
          } catch (error) {
            // Handle errors if necessary
            console.error(error);
            throw error; // Re-throw the error if needed
          }
        };
        
        // Call the function
        const {meshes} = await loadModels('board.gltf');

        let boardRootMesh = meshes.find(mesh => mesh.name === '__root__');

        if (boardRootMesh) {
          // Example: Move the root mesh to a specific position
          boardRootMesh.position = new Vector3(5.5, 6, 0);
      }

        const {meshes:meshes_capture} = await loadModels('captur.gltf');
        const {meshes:bulbMeshes} = await loadModels('bulb.gltf');
        // Now modelsResult contains the result directly
        // console.log(meshes_capture);

   

        const rootMesh = meshes_capture.find(mesh => mesh.name === '__root__');

        const bulb = bulbMeshes.find(mesh => mesh.name === 'bulb');

        // if (bulb) {
        //   console.log('here is the bulb',bulb);
        // }else{
        //   console.log('bulb not found')
        // }

        if (rootMesh) {
          // Example: Move the root mesh to a specific position
          rootMesh.position = new Vector3(-22.5, 9, 0);
      }
        
       // console.log(meshes);

        const addedSpheres: Mesh[] = [];
        const capturedSpheres: Mesh[] = [];

        let sphere_count: number  = 1;

        //const housesToAccess = ['house-1', 'house-2', 'house-3', 'house-4', 'house-5', 'house-6', 'house-7', 'house-8', 'house-9', 'house-10', 'house-11', 'house-12'];

        
          // var box = MeshBuilder.CreateBox('box', { size: 1 }, scene);

          var material = new StandardMaterial('material', scene);

          console.log(player_identity,playing_next)
          // Assuming player_identity is a boolean variable
          if (!start.inprogress && player_identity === 'player-1') {
              // Set the material color to green
              material.diffuseColor = new Color3(0, 1, 0); // Green
              material.specularColor = new Color3(1, 1, 1);
              // box.material = material;

              if (bulb){
                bulb.material = material;
              }
              
          }


          

          // box.position.x = 22.5; // Half of the box's width in the negative x direction
          // box.position.y = 15;   // Half of the box's height in the positive y direction
          // box.position.z = 2;

          const bulbRootMesh = bulbMeshes.find(mesh => mesh.name === '__root__');

          if (bulbRootMesh) {
            // Example: Move the root mesh to a specific position
            bulbRootMesh.position = new Vector3(22.5, 15, 0);
        }
          


          const defaultSpheres = () : void => {
                  const selectedMeshes = housesToAccess
                  .map((houseKey) => {
                    const model = meshes.find((model) => model.id === houseKey);
                    return model ? model: null;
                  })
                  .filter(Boolean);

                //console.log(selectedMeshes);
          
                  selectedMeshes.forEach((mesh) => {

                    if (mesh){
                      const house = houses[mesh.name];
                      //console.log(`Mesh name: ${mesh.name}, Seeds count before loop: ${house.seeds.length}`);
                     const houseSeeds = house.seeds;

                     houseSeeds.forEach((seed) => {
                        addSphereInsideMesh(mesh,seed.seedName,false,true);
                     })
                      
                      // Additional logic if needed
                    //console.log(house.houseNumber, house.seeds);
                    }
                  });
                }



        
        // Function to add a small sphere inside the clicked mesh
      // Function to add a small sphere inside the clicked mesh
      function addSphereInsideMesh(mesh: AbstractMesh,seedName: string,capture:boolean = false,isDefault:boolean=false) {
        // Create a new sphere with MeshBuilder
        const newSphere = MeshBuilder.CreateSphere(seedName, { diameter: 1 }, scene); // Adjust the diameter as needed

        let sphereADefault: boolean = false;
        // Compute the center of the clicked mesh's bounding box in world space
        const boundingBoxCenter =  () : Vector3 => {

          if (isDefault){
            if(boardRootMesh){
              const offset = boardRootMesh.position.clone();
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

        const sphereMaterial = new StandardMaterial(`seed-${sphere_count}`, scene);
        sphereMaterial.diffuseTexture = new Texture(sphereTexture, scene);
        newSphere.material = sphereMaterial;

        // Check for collisions with previously added spheres
        if (checkSphereCollisions(newSphere, mesh.name === 'capture-house' ? true : false)) {
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

          // Function to calculate a new position for the sphere in case of collision
          function calculateNewSpherePosition(mesh: AbstractMesh,isDefaultSphere = false): Vector3 {
            // Get the center of the clicked mesh's bounding box in world space
            //const boundingBoxCenter = mesh.getBoundingInfo().boundingBox.centerWorld;

            const boundingBoxCenter =  () : Vector3 => {

              if (isDefaultSphere){
                if(boardRootMesh){
                  const offset = boardRootMesh.position.clone();
                  const boundingBoxCenter = mesh.getBoundingInfo().boundingBox.centerWorld;
                  const resultantVector = boundingBoxCenter.add(offset);
                  return resultantVector
                }else {

                  return mesh.getBoundingInfo().boundingBox.centerWorld;
                }
              }else{
                return mesh.getBoundingInfo().boundingBox.centerWorld;
              }   
            }

            // Calculate random offsets for X, Y, and Z directions
            const xOffset = (Math.random() - 0.5) * 2.4; // Adjust the range of X offset as needed
            const yOffset = (Math.random() - 0.5) * 1.4; // Adjust the range of Y offset as needed
            const zOffset = (Math.random() - 0.5) * 2.6; // Adjust the range of Z offset as needed

            const boundingBoxCenterResult = boundingBoxCenter()

            // Apply the random offsets to the bounding box center
            const newPosition = new Vector3(
              boundingBoxCenterResult.x + xOffset,
              boundingBoxCenterResult.y + yOffset,
              boundingBoxCenterResult.z + zOffset
            );

            if (mesh.name === 'capture-house'){
              console.log("new position sphere", newPosition);
            }

            return newPosition;
          }

          const agent_move = async (board_state : string)  => {

            console.log("this i sthe board state that will be sent", board_state)

            const sendInput = async ()  => {
              setLoading(true);
              // Start a connection
              const provider = new JsonRpcProvider(HARDHAT_LOCALHOST_RPC_URL);
              const signer = ethers.Wallet.fromMnemonic(
                  HARDHAT_DEFAULT_MNEMONIC,
                  `m/44'/60'/0'/0/${accountIndex}`
              ).connect(provider);
  
              // Instantiate the InputBox contract
              const inputBox = InputBox__factory.connect(
                  INPUTBOX_ADDRESS,
                  signer
              );
  
  
              const hardcodedPayload = board_state.toString();
  
              // Encode the input
              const inputBytes = ethers.utils.toUtf8Bytes(hardcodedPayload);
  
  
              // Send the transaction
              const tx = await inputBox.addInput(DAPP_ADDRESS, inputBytes);
              console.log(`transaction: ${tx.hash}`);
              toast({
                  title: "Transaction Sent",
                  description: "waiting for confirmation",
                  status: "success",
                  duration: 9000,
                  isClosable: true,
                  position: "top-left",
              });
  
              // Wait for confirmation
              console.log("waiting for confirmation...");

              try {
                // Send the transaction and wait for confirmation
                const receipt = await tx.wait(1);
                
                // Search for the InputAdded event
                const event = receipt.events?.find((e) => e.event === "InputAdded");

                setLoading(false);
                toast({
                    title: "Transaction Confirmed",
                    description: `Input added => index: ${event?.args?.inputIndex} `,
                    status: "success",
                    duration: 9000,
                    isClosable: true,
                    position: "top-left",
                });
                console.log(`Input added => index: ${event?.args?.inputIndex} `);
            
                // If the transaction was successful and event was emitted, proceed with waiting and then fetching data
                if (event) {
                    setTimeout(async () => {
                        try {
                            const response = await fetch("http://localhost:8080/graphql", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: '{ "query": "{ notices { edges { node { payload } } } }" }',
                            });
                            
                            const result = await response.json();
                            
                            // Process the fetched data

                            console.log("Zotete",result.data.notices.edges)

                            move_notices = result.data.notices.edges;

                            // for (let edge of result.data.notices.edges) {
                            //     let payload = edge.node.payload;
                            //     // Do something with the payload

                            //     console.log("this here is the payload",payload);

                            //     const stringValue = ethers.utils.toUtf8String(payload);
                            //     console.log(stringValue); 
                            // }
                        } catch (error) {
                            console.error("Error occurred while fetching data:", error);
                        }
                    }, 5000); // Wait for 5 seconds (5000 milliseconds) after the event
                } else {
                    console.error("InputAdded event not found in transaction receipt.");
                }
            } catch (error) {
                console.error("Error occurred while processing transaction:", error);
            }



          };


          await sendInput();

          }


          const agent_play = (agent_house_play_choice :string) => {



            const house = houses[agent_house_play_choice];

            console.log(house)

            if (house) {
              // Print the position and seed number of the corresponding house

              const agent_seeds_on_hand = house.seeds

              const agent_seeds_number = house.seedsNumber



              const player = playersStates["player-2"];
              

              player.onHand = house.seeds

         
              house.seedsNumber = 0;

              const mesh_picked_agent = meshes.find((model) => model.id === agent_house_play_choice);
              

             // console.log("remaining seed", numberOfSeedsPicked);

              //addSphereInsideMesh(meshClicked,player.onHand[0].seedName);

              let current_house = agent_house_play_choice;

              const seeds = house.seeds;

              // console.log("the seeds",seeds);

               seeds.forEach((seed) => {
                 // Find the sphere in the addedSpheres array by name
                
                 const sphere = addedSpheres.find(s => s.name === seed.seedName);

                // console.log(sphere);
               
                // console.log(`Attempt to dispose of sphere with name '${seed.seedName}':`, sphere);
               
                 if (sphere) {
                 //  console.log(`Disposing of sphere with name '${seed.seedName}'`);
                   sphere.dispose();
                   // Remove the disposed sphere from the addedSpheres array
                   const index = addedSpheres.indexOf(sphere);
                   if (index !== -1) {
                     addedSpheres.splice(index, 1);
                   }
                   
                 } else {
                   console.log(`Sphere not found with name '${seed.seedName}'`);
                 }
               });


              const nextMove = (current_house: string) : string[] => {
                 
                const indexOfCurrentHouse = housesToAccess.indexOf(current_house);

                const indexOfNextHouse = indexOfCurrentHouse < 11 ? indexOfCurrentHouse + 1 : 0;

                const house = housesToAccess[indexOfNextHouse];

                return [house];
            }


              for (let i = 1; i <= agent_seeds_number; i++){

                const selected_house_name = nextMove(current_house)[0];

              

                const agent_next_mesh_move = meshes.find((model) => model.name === selected_house_name);

                if (agent_next_mesh_move){


                  const house_selcted = houses[selected_house_name]

                  const seedAdded = player.onHand[0];
                  
  
                  addSphereInsideMesh(agent_next_mesh_move,player.onHand[0].seedName);
  
                  house_selcted.seeds.push(player.onHand[0]);
  
                  player.onHand.splice(0, 1);
    
                  player.previouseHouse = player.nextHouse[0];


                }

                if ( i === agent_seeds_number){

            
                    
                  player.nextHouse= []
                  player.originalHouse =[]

 
                  playing_next = "player-1";
                  player_identity = "player-1"

                  const playerIcon = document.getElementById('player-icon');
                  if (playerIcon) {
                    playerIcon.innerHTML =  '&#128526;';
                  }

                  console.log("this is the player playing next ", playing_next)

                  start.player = playing_next ;
                  setPlayerTurn(playing_next);
    
                  material.diffuseColor = new Color3(0, 1, 0);
                  material.specularColor = new Color3(1, 1, 1);
                  // box.material = material;
                  if (bulb){
                    bulb.material = material;
                  }
    
                  const isPlayeerHouse =  playerHouses.includes(selected_house_name);
    
                  if (!isPlayeerHouse && (house.seeds.length === 2 || house.seeds.length === 3)){
    
                    const seeds = house.seeds;
                    const captureMesh = meshes_capture.find(mesh => mesh.name === 'capture-house');
    
                    seeds.forEach((seed) => {
                      // Find the sphere in the addedSpheres array by name
                     
                      const sphere = addedSpheres.find(s => s.name === seed.seedName);
    
                    //  console.log(sphere);
                    
                     // console.log(`Attempt to dispose of sphere with name '${seed.seedName}':`, sphere);
                          
                      if (sphere && captureMesh) {
                       // console.log(`Disposing of sphere with name '${seed.seedName}'`);
                       //const theSphere = sphere;
                       capturedSpheres.push(sphere);
    
                       console.log("The captured",capturedSpheres.length)
                        
                        
                        sphere.dispose();
    
                        addSphereInsideMesh(captureMesh,seed.seedName,true);
    
                        if (capturedSpheres.length > 24){
    
                          console.log(" You are the winner!!!")
                        }
                        // Remove the disposed sphere from the addedSpheres array
                        const index = addedSpheres.indexOf(sphere);
                        if (index !== -1) {
                          addedSpheres.splice(index, 1);
                        }
                      } else {
                        console.log(`Sphere not found with name '${seed.seedName}'`);
                      }
                    });
    
                  }

                  isPlayerTurn = true;

                }

                current_house = selected_house_name;



              }

              //console.log(`House ${house.houseNumber}: Position - x: ${clickedMesh.position.x}, y: ${clickedMesh.position.y}, z: ${clickedMesh.position.z}, Seed: ${house.seedNumber}`);
            } else {
              console.warn("House not found for clicked mesh: " + agent_house_play_choice);
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

      // winId:string;
      // winTrace:string;
      // opponent_address:string;
      // player_username:string;


 

      function applyRandomDeformities(mesh: Mesh, strength: number) {
        const positions = mesh.getVerticesData(VertexBuffer.PositionKind) as Float32Array;
      
        // Apply random deformities to each vertex
        for (let i = 0; i < positions.length; i += 3) {
          const randomX = (Math.random() - 0.5) * strength;
          const randomY = (Math.random() - 0.5) * strength;
          const randomZ = (Math.random() - 0.5) * strength;
      
          positions[i] += randomX;
          positions[i + 1] += randomY;
          positions[i + 2] += randomZ;
        }
      
        mesh.updateVerticesData(VertexBuffer.PositionKind, positions);
      }

        // console.log(modelsPromise)
        let numberOfSeedsPicked: number = 0;

          scene.onPointerDown = async function (evt, pickResult) {
            

            if (!start.inprogress && player_identity === 'player-1'){
              isPlayerTurn = true;
              start.inprogress = true;
             
            }else if(start.inprogress && player_identity === playing_next){
              isPlayerTurn = true;
            }else{
              isPlayerTurn = false;
              console.log(player_identity,playing_next)
            }
          
            if (pickResult.hit && pickResult.pickedMesh && playersStates[player_identity].onHand.length === 0 && isPlayerTurn) {
              // Find the corresponding house in the houses object
              const clickedMesh: AbstractMesh = pickResult.pickedMesh;
              const house = houses[clickedMesh.name];
              const isOriginalHouseEmpty = playersStates[player_identity].originalHouse.length === 0
              const isOrginalHouse = !isOriginalHouseEmpty && playersStates[player_identity].originalHouse[0] === clickedMesh.name;
              const isHousePlayers = playerHouses.includes(clickedMesh.name)
              const isNextHousesEmpty = playersStates[player_identity].nextHouse.length === 0;
              const validHouseMove = isNextHousesEmpty ? housesToAccess[housesToAccess.indexOf(clickedMesh.name) + 1] : playersStates[player_identity].nextHouse[0];
              const checkMove = validHouseMove === housesToAccess[housesToAccess.indexOf(clickedMesh.name)];
              const isValidMove = isHousePlayers 

              console.log(isValidMove);
              console.log(playerHouses,clickedMesh.name)

             
              

              if (house && isValidMove && (!isOrginalHouse || isOriginalHouseEmpty)) {

                //console.log(house.seeds.length)
                // Print the position and seed number of the corresponding house
                numberOfSeedsPicked = house.seedsNumber;

                house.seedsNumber = 0;

               // console.log(`House ${house.houseNumber}: Position - x: ${clickedMesh.position.x}, y: ${clickedMesh.position.y}, z: ${clickedMesh.position.z}, Seed: ${house.seedNumber}`);
             
               // console.log("number of picked seeds", numberOfSeedsPicked);

                const seeds = house.seeds;

                console.log("the seeds",seeds);

                seeds.forEach((seed) => {
                  // Find the sphere in the addedSpheres array by name
                 
                  const sphere = addedSpheres.find(s => s.name === seed.seedName);

                //  console.log(sphere);
                
                 // console.log(`Attempt to dispose of sphere with name '${seed.seedName}':`, sphere);
                      
                  if (sphere) {
                   // console.log(`Disposing of sphere with name '${seed.seedName}'`);
                    sphere.dispose();
                    // Remove the disposed sphere from the addedSpheres array
                    const index = addedSpheres.indexOf(sphere);
                    if (index !== -1) {
                      addedSpheres.splice(index, 1);
                    }
                  } else {
                    console.log(`Sphere not found with name '${seed.seedName}'`);
                  }
                });
                
                playersStates[player_identity].onHand = house.seeds

                house.seeds = [];

                playersStates[player_identity].previouseHouse = state.nextHouse[0];

                const nextMove = () : string[] => {
                   
                    const indexOfCurrentHouse = housesToAccess.indexOf(clickedMesh.name);

                    const indexOfNextHouse = indexOfCurrentHouse < 11 ? indexOfCurrentHouse + 1 : 0;

                    const house = housesToAccess[indexOfNextHouse];

                    //console.log("the house to",house);

                    return [house];
                }


                playersStates[player_identity].nextHouse = nextMove();
                playersStates[player_identity].originalHouse = [clickedMesh.name];

                //console.log("Remaining seeds ", house.seeds);
              // console.log(playersStates[player_identity].nextHouse)




              const move: Move = {

                selectedHouse:house,
                seedAdd:[],
                player:player_identity,
                action:0,
                progress:true,

              };

              // illegal move
              if (move === null) return false;
              } else {
                console.warn("House not found for clicked mesh: " + clickedMesh.name);
              }
            } else if (pickResult.hit && pickResult.pickedMesh && playersStates[player_identity].onHand.length !== 0 && isPlayerTurn) {
              // Find the corresponding house in the houses object
              const clickedMesh: AbstractMesh = pickResult.pickedMesh;
              const house = houses[clickedMesh.name];
              console.log("player states", playersStates);
              const isValidMove = clickedMesh.name === playersStates[player_identity].nextHouse[0];
              //console.log('how?',playersStates[player_identity].nextHouse)
              //console.log('isvalidmove',playersStates[player_identity].nextHouse[0],clickedMesh.name);

              if (house && isValidMove) {
                // Print the position and seed number of the corresponding house
                
                house.seedsNumber +=1;
                const player = playersStates[player_identity];

               // console.log("remaining seed", numberOfSeedsPicked);

                addSphereInsideMesh(clickedMesh,player.onHand[0].seedName);

                const seedAdded = player.onHand[0];

                house.seeds.push(player.onHand[0]);
                player.onHand.splice(0, 1);

                player.previouseHouse = player.nextHouse[0];

                const nextMove = () : string[] => {
                   
                    const indexOfCurrentHouse = housesToAccess.indexOf(clickedMesh.name);

                    const indexOfNextHouse = indexOfCurrentHouse < 11 ? indexOfCurrentHouse + 1 : 0;

                    const house = housesToAccess[indexOfNextHouse];

                    return [house];
                }


               if (player.onHand.length === 0){

                player.nextHouse= []
                player.originalHouse =[]


                const nextPlayer = player_identity === 'player-1' ? 'player-2' :'player-1';
                
                playing_next = nextPlayer;
                start.player = playing_next ;
                setPlayerTurn(playing_next);

                material.diffuseColor = new Color3(1, 0, 0);
                material.specularColor = new Color3(1, 1, 1);
                // box.material = material;
                if (bulb){
                  bulb.material = material;
                }

                const isPlayeerHouse =  playerHouses.includes(clickedMesh.name);

                if (!isPlayeerHouse && (house.seeds.length === 2 || house.seeds.length === 3)){

                  const seeds = house.seeds;
                  const captureMesh = meshes_capture.find(mesh => mesh.name === 'capture-house');

                  trace = trace + " " + clickedMesh.name;

                  seeds.forEach((seed) => {
                    // Find the sphere in the addedSpheres array by name
                   
                    const sphere = addedSpheres.find(s => s.name === seed.seedName);
  
                  //  console.log(sphere);
                  
                   // console.log(`Attempt to dispose of sphere with name '${seed.seedName}':`, sphere);
                        
                    if (sphere && captureMesh) {
                     // console.log(`Disposing of sphere with name '${seed.seedName}'`);
                     //const theSphere = sphere;
                     capturedSpheres.push(sphere);

                     console.log("The captured",capturedSpheres.length)
                      
                      
                      sphere.dispose();

                      addSphereInsideMesh(captureMesh,seed.seedName,true);

                      if (capturedSpheres.length > 24){

                        const win_id = uuidv4();
                        const winId = win_id;
                        const winTrace = trace;
                        const opponent_address = "0x12";
                        const opponentAddress = ethers.utils.getAddress(opponent_address);
                        const player_username = username;

                        console.log(" You are the winner!!!")
                      }
                      // Remove the disposed sphere from the addedSpheres array
                      const index = addedSpheres.indexOf(sphere);
                      if (index !== -1) {
                        addedSpheres.splice(index, 1);
                      }
                    } else {
                      console.log(`Sphere not found with name '${seed.seedName}'`);
                    }
                  });

                }

                // gets the seeds state -- // code should be refactored

                const seedsHouse1 = (houses['house-1'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);
                const seedsHouse2 = (houses['house-2'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);
                const seedsHouse3 = (houses['house-3'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);
                const seedsHouse4 = (houses['house-4'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);
                const seedsHouse5 = (houses['house-5'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);
                const seedsHouse6 = (houses['house-6'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);
                const seedsHouse7 = (houses['house-7'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);
                const seedsHouse8 = (houses['house-8'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);
                const seedsHouse9 = (houses['house-9'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);
                const seedsHouse10 = (houses['house-10'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);
                const seedsHouse11 = (houses['house-11'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);
                const seedsHouse12 = (houses['house-12'].seeds || []).map((seed : Seed) => `"seed${seed.seedId}"`);



                // gets the seeds state -- // code should be refactored

                const seedsNumberHouse1 = houses['house-1'].seedsNumber;
                const seedsNumberHouse2 = houses['house-2'].seedsNumber;
                const seedsNumberHouse3 = houses['house-3'].seedsNumber;
                const seedsNumberHouse4 = houses['house-4'].seedsNumber;
                const seedsNumberHouse5 = houses['house-5'].seedsNumber;
                const seedsNumberHouse6 = houses['house-6'].seedsNumber;
                const seedsNumberHouse7 = houses['house-7'].seedsNumber;
                const seedsNumberHouse8 = houses['house-8'].seedsNumber;
                const seedsNumberHouse9 = houses['house-9'].seedsNumber;
                const seedsNumberHouse10 = houses['house-10'].seedsNumber;
                const seedsNumberHouse11 = houses['house-11'].seedsNumber;
                const seedsNumberHouse12 = houses['house-12'].seedsNumber;

  

                const playerIcon = document.getElementById('player-icon');
                if (playerIcon) {
                  playerIcon.innerHTML = '&#128125;'
                }
                

                const state_to_agent =`{"method":"agent_move","args":{"name":"agent","board_state":{"House1":{"seeds":[${seedsHouse1}],"seeds_number":${seedsNumberHouse1}},"House2":{"seeds":[${seedsHouse2}],"seeds_number":${seedsNumberHouse2}},"House3":{"seeds":[${seedsHouse3}],"seeds_number":${seedsNumberHouse3}},"House4":{"seeds":[${seedsHouse4}],"seeds_number":${seedsNumberHouse4}},"House5":{"seeds":[${seedsHouse5}],"seeds_number":${seedsNumberHouse5}},"House6":{"seeds":[${seedsHouse6}],"seeds_number":${seedsNumberHouse6}},"House7":{"seeds":[${seedsHouse7}],"seeds_number":${seedsNumberHouse7}},"House8":{"seeds":[${seedsHouse8}],"seeds_number":${seedsNumberHouse8}},"House9":{"seeds":[${seedsHouse9}],"seeds_number":${seedsNumberHouse9}},"House10":{"seeds":[${seedsHouse10}],"seeds_number":${seedsNumberHouse10}},"House11":{"seeds":[${seedsHouse11}],"seeds_number":${seedsNumberHouse11}},"House12":{"seeds":[${seedsHouse12}],"seeds_number":${seedsNumberHouse12}}}}}`;

                await agent_move(state_to_agent);

                let a_move;
              

                setTimeout(() => {
                  
                  if (move_notices.length > 0) {
                      const new_agent_move = move_notices[move_notices.length - 1];
                      a_move = hexToString(new_agent_move.node.payload);
                  } else {
                      a_move = previous_agent_house;
                  }
                  // Your entire block of code here, which will be executed after the delay
                  console.log("a_move:", a_move);

                    const dataString = a_move;
  
                      // Regular expression to match the coordinates (x, y)
                      const regex = /\((\d+), (\d+)\)/;
  
                      // Match the regex with the data string
                      const match = dataString.match(regex);
  
                      if (match) {
                          // Extract the first and second coordinates from the match
                          const coordinateX = parseInt(match[1]);
                          const coordinateY = parseInt(match[2]);
                          
                          // Log the coordinates
                          // console.log("Coordinates:", coordinateX, coordinateY);

                          const coordinateKey = `${coordinateX},${coordinateY}`;

                          // console.log(" tye    sd ", coordinateKey );

                          const selected_house = housesCoordinates[coordinateKey]

                          agent_play(selected_house);
                          

                          // console.log("The slected house ", selected_house)

                      } else {
                          console.log("Coordinates not found.");
                      }
  
                  

              }, 5100);

               


                const move: Move = {

                  selectedHouse:house,
                  seedAdd:[seedAdded],
                  player:nextPlayer,
                  action:1,
                  progress:true,
  
                };

                // illegal move
                if (move === null) return false;

               }else{

                player.nextHouse = nextMove();
                player.originalHouse = [clickedMesh.name];
                const nextPlayer = player_identity;

                playing_next = nextPlayer;
                setPlayerTurn(playing_next);




                const move: Move = {

                  selectedHouse:house,
                  seedAdd:[seedAdded],
                  player:nextPlayer,
                  action:1,
                  progress:true,
  
                };


                

               }

                //console.log(`House ${house.houseNumber}: Position - x: ${clickedMesh.position.x}, y: ${clickedMesh.position.y}, z: ${clickedMesh.position.z}, Seed: ${house.seedNumber}`);
              } else {
                console.warn("House not found for clicked mesh: " + clickedMesh.name);
                console.log(house,"--------",isValidMove)
                console.log(playersStates[player_identity].onHand.length)
              }
            } 
          };

        // const ball = MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
        // ball.position = new Vector3(0, 1, 0);

        
        
        // Assuming 'scene' is your Babylon.js scene object
        engine.runRenderLoop(() => {

  
          scene.render();
        });
      
        window.addEventListener('resize', () => {
          engine.resize();
        });

        //ground.material = CreateGroundMaterial(scene);
        // ball.material = CreateBallMaterial(scene);

        const  playersTurn: string =playing_next;

        

      
        return {scene, defaultSpheres,playersTurn};
      };

 
      const canvasRef = useRef<HTMLCanvasElement>(null);
      const [scene, setScene] = useState<Scene | undefined>(undefined);
      const [makeAMove, setMakeAMove] = useState<(move: Move) => void>(() => {});
      const [player_turn, setThePlayerTurn] = useState<(playerTurn: string) => void>(() => {})
      const sceneRef = useRef(null);
    

      useEffect(() => {
        const loadScene = async (): Promise<() => void> => {
          const {scene:sceneCreated, defaultSpheres,playersTurn:player} = await createScene(canvasRef.current);
          defaultSpheres();
          
          // Optionally, you can handle the scene instance or perform additional actions here

          if (sceneCreated) {
            setScene(sceneCreated);
            setPlayerTurn(player);
            console.log('ebu check',player);
          }
          
          return () => {
            if (sceneCreated) {
              sceneCreated.dispose(); // Clean up the scene when the component unmounts
            }
          };
        };
    
        const cleanup = loadScene().then(cleanupFunction => cleanupFunction);
    
        return () => {
          cleanup.then(cleanupFunction => cleanupFunction());
        };
      }, [playerHouses,overBool,setOverBool,overText,setOvertText,overTitle,setOverTitle]);


      

      

      

      //console.log("am available here",playerTurn);

      useEffect(() => {
        if (!isWaitingForOpponent && !inProgress) {
          let newPlayerHouses, newPlayerTurn;
    

            newPlayerHouses = housesToAccess.slice(0, 6);
            newPlayerTurn = 'player-1';

          // Update playerHouses only if it has changed
          if (JSON.stringify(newPlayerHouses) !== JSON.stringify(playerHouses)) {
            setPlayerHouses(newPlayerHouses);
          }
    
          // Update playerTurn only if it has changed
          if (newPlayerTurn !== playerTurn) {
            setPlayerTurn(newPlayerTurn);
          }
        }
      }, [isWaitingForOpponent, inProgress, player_identity, housesToAccess, playerHouses, playerTurn]);

      let buttonProps:ButtonProps = {
        isLoading: false
    };

    if (loading) {
        buttonProps.isLoading = true;
    }
    
  return (
    <>
        <div className='m-5'>
            <div>
            <table>
              <tr>
                <th><div>12</div></th>
                <th><div>11</div></th>
                <th><div>10</div></th>
                <th><div>9</div></th>
                <th><div>8</div></th>
                <th><div>7</div></th>
              </tr>
              <tr>
                <td><div>1</div></td>
                <td><div>2</div></td>
                <td><div>3</div></td>
                <td><div>4</div></td>
                <td><div>5</div></td>
                <td><div>6</div></td>
              </tr>
            </table>
            </div>
            <div className='pt-2'>
            <Card sx={{
              backgroundColor:'rgb(15 23 42)',
              borderRadius: '16px 16px 0 0'
            }}>
            <CardContent>
              <Grid container spacing={4} alignItems="center">
                <Grid item width={'100%'}>
                  {isWaitingForOpponent ? (
                  <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <CircularProgress size={18} />
                  </Grid>
                  <Grid item>
                    <Typography variant="body1" color={'whitesmoke'}>Waiting for opponent</Typography>
                  </Grid>
                  <Grid item>
                  <CopyToClipboard text={room} onCopy={handleCopySuccess}>
                    <Button color="primary">
                      {isCopied ? 'Copied!' : 'Copy Room Id to Clipboard'}
                    </Button>
                  </CopyToClipboard>
                  </Grid>
                </Grid>
                  ) : (
                    <>
                    <Grid item>
                    <div>
                      <Typography variant="h6" color={'white'} sx={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft:0,
                        fontSize:40,
                        color:'#43a047'
                      }}>Current Player Turn: <span className='player-icon' id='player-icon'></span></Typography>
                      
                    </div>
                  </Grid>

                <Grid container spacing={3} sx={{margin:'auto',textAlign:'center',alignItems:"center",position:'center',fontSize:30,color:'#f57c00',fontWeight:'bold'}} columns={16}>
                  Your Houses: 
                  {playerHouses.map((houseName, index) => (
                    <Grid item xs={6} sm={2} md={0} lg={2} key={index}>
                      <Paper elevation={3} sx={{padding:1,display:'flex'}} >
                        <HouseIcon />
                        <Typography variant="h6">{houseName}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid> 
{/* 
                <Button {...buttonProps} type="submit" color="success">
                  🤖
                </Button>  */}

                  </>
                  )}

                </Grid>
  
              </Grid>
            </CardContent>
          </Card>
        </div>
        <canvas className='canvas rounded-md' ref={canvasRef}>
        
        </canvas>
        </div>


    </>
  )
}

export default Canvas