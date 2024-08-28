'use client'

import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useToast,
  HStack,
  useClipboard,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  PopoverBody,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton
} from '@chakra-ui/react'
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  
} from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import { shortenAddress } from '../../utils'
import { useEffect,useState } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { Copy,  LogOut, Wallet } from 'lucide-react';

export default function WithSubnavigation() {
  const { isOpen, onToggle } = useDisclosure();
  const { isOpen: isOpenPopover, onToggle: onTogglePopover, onClose: onClosePopover } = useDisclosure()
  const toast = useToast();
  
  const { address, isConnected, chain} = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);
 
  

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "The address has been copied to your clipboard.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const buttonBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const buttonColor = 'white';
  const menuBg = 'slate.800';
  const menuHoverBg = 'slate.700';
  const menuTextColor = 'purple';

  return (
    <Box>
      <Flex
        bg={useColorModeValue('black', 'purple.800')}
        color={useColorModeValue('purple.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('purple.200', 'purple.900')}
        align={'center'}>
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
            <Link to={'/'}>

                    <Text
                    textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                    fontFamily={'heading'}
                    fontWeight={'bold'}
                    color={useColorModeValue('Purple.800', 'white')}>
                        Oware
                </Text>
            </Link>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>


        {isConnected ? (
                <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  bg={buttonBg}
                  color={buttonColor}
                  fontWeight="bold"
                  borderRadius="full"
                  px={6}
                  _hover={{ opacity: 0.9 }}
                  _active={{ opacity: 0.8 }}
                >
                  <Flex align="center">
                    <Icon as={Wallet} mr={2} />
                    {shortenAddress(address || '')}
                  </Flex>
                </MenuButton>
                <MenuList bg={menuBg} borderColor="purple.500" borderWidth={2} boxShadow="lg">
                  <MenuItem onClick={handleCopyAddress} _hover={{ bg: menuHoverBg }} color={menuTextColor}>
                    <Icon as={Copy} mr={2} />
                    <Text>Copy Address</Text>
                  </MenuItem>
                  <MenuItem isDisabled _hover={{ bg: menuHoverBg }} color={menuTextColor}>
                    <Box>
                      <Text fontWeight="bold">Chain: {chain?.name}</Text>
                      <Text fontSize="sm" color="gray.400">ID: {chain?.id}</Text>
                    </Box>
                  </MenuItem>
                  <MenuDivider borderColor="gray.600" />
                  <Popover
                    isOpen={isOpenPopover}
                    onClose={onClosePopover}
                    placement='right-start'
                    closeOnBlur={false}
                  >
                    <PopoverTrigger>
                      <Button 
                      w="100%" 
                      justifyContent="flex-start" 
                      fontWeight="normal" 
                      bg={'white'} 
                      _hover={{ bg: menuHoverBg }}
                      onClick={onTogglePopover}
                    >
                      Switch Chain
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent bg={menuBg} borderColor="purple.500">
                      <PopoverHeader fontWeight='semibold' color='purple.300'>Select Network</PopoverHeader>
                      <PopoverArrow bg={menuBg} />
                      <PopoverCloseButton color={menuTextColor} />
                      <PopoverBody>
                        {chains.map((chainOption) => (
                          <MenuItem
                            key={chainOption.id}
                            onClick={() => {
                              switchChain({ chainId: chainOption.id });
                              onClosePopover();
                            }}
                            _hover={{ bg: menuHoverBg }}
                            color={menuTextColor}
                          >
                            {chainOption.name}
                          </MenuItem>
                        ))}
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                  <MenuDivider borderColor="gray.600" />
                  <MenuItem onClick={() => disconnect()} color="red.300" _hover={{ bg: menuHoverBg }}>
                    <Icon as={LogOut} mr={2} />
                    <Text>Disconnect</Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  bg={buttonBg}
                  color={buttonColor}
                  fontWeight="bold"
                  borderRadius="full"
                  px={6}
                  _hover={{ opacity: 0.9 }}
                  _active={{ opacity: 0.8 }}
                >
                  Connect Wallet
                </MenuButton>
                <MenuList bg={menuBg} borderColor="purple.500" borderWidth={2} boxShadow="lg">
                  {connectors.map((connector) => (
                    <MenuItem 
                      key={connector.id}
                      onClick={() => connect({ connector })}
                      _hover={{ bg: menuHoverBg }}
                      color={menuTextColor}
                    >
                      <Icon as={Wallet} mr={2} />
                      <Text>{connector.name}</Text>
                    </MenuItem>
                  ))}
                  <MenuDivider borderColor="gray.600" />
                  <MenuItem isDisabled _hover={{ bg: menuHoverBg }} color={menuTextColor}>
                    <Text fontWeight="bold">Status: {status.toUpperCase()}</Text>
                  </MenuItem>
                  {error && (
                    <MenuItem isDisabled color="red.300" _hover={{ bg: menuHoverBg }}>
                      <Text fontWeight="bold">Error: {error.message}</Text>
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
        )}
 
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  )
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('purple.600', 'purple.200')
  const linkHoverColor = useColorModeValue('purple.800', 'white')
  const popoverContentBgColor = useColorModeValue('white', 'purple.800')

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem: NavItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Box
                as="a"
                p={2}
                href={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}>
                {navItem.label}
              </Box>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}>
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  )
}

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Box
      as="a"
      href={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('pink.50', 'purple.900') }}>
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'pink.400' }}
            fontWeight={500}>
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}>
          <Icon color={'pink.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Box>
  )
}

const MobileNav = () => {
  return (
    <Stack bg={useColorModeValue('white', 'purple.800')} p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Box
        py={2}
        as="a"
        href={href ?? '#'}
        justifyContent="space-between"
        alignItems="center"
        _hover={{
          textDecoration: 'none',
        }}>
        <Text fontWeight={600} color={useColorModeValue('purple.600', 'purple.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Box>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('purple.200', 'purple.700')}
          align={'start'}>
          {children &&
            children.map((child) => (
              <Box as="a" key={child.label} py={2} href={child.href}>
                {child.label}
              </Box>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
}

interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: string
}


const NAV_ITEMS= [
  {
    label: 'Leaderboard',
    href: '/leaderboard',
  },
  {
    label: 'Challenges',
    href: '/challenges',
  },
  {
    label: 'Tournaments',
    href: '/tournaments',
  },
  {
    label: 'Profile',
    href: '/profile',
  },
  {
    label: 'About',
    href: '/about',
  },
]