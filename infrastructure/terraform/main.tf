# ==== Azure resources ====

# Resource group
resource "azurerm_resource_group" "sonex-rg" {
  name     = "sonex_resources"
  location = "East US"
  tags = {
    environment = "Production"
  }
}

resource "azurerm_network_security_group" "sonex-nsg" {
  name                = "sonex-nsg"
  location            = azurerm_resource_group.sonex-rg.location
  resource_group_name = azurerm_resource_group.sonex-rg.name

  security_rule {
    name                       = "AllowOutbound"
    priority                   = 100
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowSSH"
    priority                   = 101
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "217.180.192.143"
    destination_address_prefix = "*"
  }
}

resource "azurerm_virtual_network" "sonex-vn" {
  name                = "sonex-vn"
  location            = azurerm_resource_group.sonex-rg.location
  resource_group_name = azurerm_resource_group.sonex-rg.name
  address_space       = ["10.0.0.0/16"]
  # dns_servers         = ["10.0.0.4", "10.0.0.5"]

  tags = {
    environment = "Production"
  }
}

resource "azurerm_subnet" "sonex-subnet" {
  name                 = "sonex-subnet"
  resource_group_name  = azurerm_resource_group.sonex-rg.name
  virtual_network_name = azurerm_virtual_network.sonex-vn.name
  address_prefixes     = ["10.0.2.0/24"]
}

resource "azurerm_subnet_network_security_group_association" "sonex-snsga" {
  subnet_id                 = azurerm_subnet.sonex-subnet.id
  network_security_group_id = azurerm_network_security_group.sonex-nsg.id
}

resource "azurerm_public_ip" "sonex-public_ip" {
  name                = "sonex-public_ip"
  location            = azurerm_resource_group.sonex-rg.location
  resource_group_name = azurerm_resource_group.sonex-rg.name
  allocation_method   = "Dynamic"
  sku                 = "Basic"
}

resource "azurerm_network_interface" "sonex-nic" {
  name                = "sonex-nic"
  location            = azurerm_resource_group.sonex-rg.location
  resource_group_name = azurerm_resource_group.sonex-rg.name
  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.sonex-subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.sonex-public_ip.id
  }
}

resource "azurerm_linux_virtual_machine" "sonex_vm" {
  name                = "sonex-vm"
  location            = azurerm_resource_group.sonex-rg.location
  resource_group_name = azurerm_resource_group.sonex-rg.name
  size                = "Standard_B2s"
  admin_username      = "sonexadmin"

  network_interface_ids = [
    azurerm_network_interface.sonex-nic.id,
  ]

  custom_data = filebase64("customdata.tpl")

  admin_ssh_key {
    username   = "sonexadmin"
    public_key = file("~/.ssh/sonex_vm.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
    name                 = "sonex-os-disk"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "server"
    version   = "latest"
  }

  computer_name                   = "sonexvm"
  disable_password_authentication = true
  tags = {
    environment = "Production"
  }
}

output "vm_public_ip" {
  value = azurerm_public_ip.sonex-public_ip.ip_address
}
