#include "PortManager.h"

PortManager::PortManager(QObject *parent)
    : QObject(parent)
{
}

/* =========================
   SERIAL SECTION
   ========================= */

void PortManager::addSerialPort(int index, const QString &portName)
{
    try {
        if (serialPorts.contains(index)) {
            serialPorts[index]->close();
            delete serialPorts[index];
            serialPorts.remove(index);
        }

        QSerialPort *port = new QSerialPort(this);
        port->setPortName(portName);
        port->setBaudRate(115200);
        port->setDataBits(QSerialPort::Data8);
        port->setParity(QSerialPort::NoParity);
        port->setStopBits(QSerialPort::OneStop);
        port->setFlowControl(QSerialPort::NoFlowControl);

        if (port->open(QIODevice::ReadWrite)) {
            connect(port, &QSerialPort::readyRead, this, [=]() {
                //QByteArray data = port->readAll();
                //emit serialDataReceived(index, QString::fromUtf8(data));
            });
            serialPorts[index] = port;
            emit notification("Connected: " + portName, "green");
        } else {
            emit notification("Failed to connect: " + portName + " — " + port->errorString(), "red");
            delete port;
        }

    } catch (const std::exception &e) {
        emit notification("Exception in addSerialPort: " + QString::fromUtf8(e.what()), "red");
    } catch (...) {
        emit notification("Unknown exception in addSerialPort: " + portName, "red");
    }
}



void PortManager::removeSerialPort(int index, bool keep)
{
    try {
        if (!serialPorts.contains(index))
            return;

        QSerialPort *port = serialPorts[index];

        if (port->isOpen())
            port->close();

        if (!keep) {
            delete port;
            serialPorts.remove(index);
        }

    } catch (const std::exception &e) {
        emit notification("Exception in removeSerialPort: " + QString::fromUtf8(e.what()), "red");
    } catch (...) {
        emit notification("Unknown exception in removeSerialPort: " + QString::number(index), "red");
    }
}



void PortManager::sendToSerial(int index, const QString &data)
{
    if (serialPorts.contains(index) && serialPorts[index]->isOpen()) {
        serialPorts[index]->write((data + "\n").toUtf8());
    }
}

QString PortManager::getSystemPortsJson()
{
    QJsonArray arr;

    auto ports = QSerialPortInfo::availablePorts();

    for (int i = 0; i < ports.size(); ++i) {
        QJsonObject obj;
        obj["index"] = i;
        obj["portName"] = ports[i].portName();
        arr.append(obj);
    }

    return QJsonDocument(arr).toJson(QJsonDocument::Compact);
}

QString PortManager::getManagedPortsJson()
{
    QJsonArray arr;

    for (auto key : serialPorts.keys()) {
        QJsonObject obj;
        obj["index"] = key;
        obj["portName"] = serialPorts[key]->portName();
        obj["isOpen"] = serialPorts[key]->isOpen();
        arr.append(obj);
    }

    return QJsonDocument(arr).toJson(QJsonDocument::Compact);
}

/* =========================
   UDP SECTION
   ========================= */

void PortManager::addUdpChannel(int index, const QString &address, quint16 port)
{
    if (udpChannels.contains(index)) {
        delete udpChannels[index];
        udpChannels.remove(index);
    }

    QUdpSocket *udp = new QUdpSocket(this);

    udp->connectToHost(address, port);

    if (udp->waitForConnected(1000)) {
        udpChannels[index] = udp;
        emit notification("UDP connected " + address + ":" + QString::number(port), "green");
    } else {
        emit notification("UDP failed " + address, "red");
        delete udp;
    }
}

void PortManager::sendUdp(int index, const QString &message)
{
    if (udpChannels.contains(index)) {
        udpChannels[index]->write((message + "\n").toUtf8());
    }
}

void PortManager::removeUdpChannel(int index)
{
    if (!udpChannels.contains(index))
        return;

    delete udpChannels[index];
    udpChannels.remove(index);

    emit notification("UDP channel removed at index " + QString::number(index), "orange");
}

QString PortManager::getUdpListJson()
{
    QJsonArray arr;

    for (auto key : udpChannels.keys()) {
        QJsonObject obj;
        obj["index"] = key;

        QHostAddress addr = udpChannels[key]->peerAddress();
        quint16 port = udpChannels[key]->peerPort();

        obj["address"] = addr.toString();
        obj["port"] = port;

        arr.append(obj);
    }

    return QJsonDocument(arr).toJson(QJsonDocument::Compact);
}


void PortManager::setDf(const QString &data)
{
    df = data;
}



void PortManager::outputs_v2()
{
    if (df.isEmpty())
        return;

    const QStringList parts = df.split("|", Qt::KeepEmptyParts);

    const int maxCount = std::max(serialPorts.size(), udpChannels.size());

    for (int i = 0; i < parts.size() && i < maxCount; ++i)
    {
        const QString &strg = parts[i];

        // Even empty string is used as a signal, we should allow it, so we comment it out
        // if (strg.trimmed().isEmpty())
        //    continue;

        QByteArray data = strg.toLatin1();

        // ======================
        // SERIAL SECTION
        // ======================
        if (i < serialPorts.size())
        {
            QSerialPort* port = serialPorts[i];

            if (port && port->isOpen())
            {
                if (port->bytesToWrite() <= 1)
                {
                    data.append('\n');  // append a newline
                    port->write(data);  // async
                }
            }
        }

        // ======================
        // UDP SECTION
        // ======================
        if (i < udpChannels.size())
        {
            QUdpSocket* socket = udpChannels[i];

            if (socket)
            {
                QByteArray udpData = data;
                udpData.append('\n');   // append newline

                socket->writeDatagram(
                    udpData,
                    socket->peerAddress(),
                    socket->peerPort()
                    );
            }
        }
    }
}


