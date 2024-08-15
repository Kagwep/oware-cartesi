class HexConverter:

    def strtohex(self, str):
        return "0x" + str.encode("utf-8").hex()

    def hextostr(self, hex):
        return bytes.fromhex(hex[2:]).decode('utf-8')
